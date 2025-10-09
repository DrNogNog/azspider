import { Router } from 'express';
import { spawnSync } from 'child_process';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';

dotenv.config();

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/search', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    console.log('Environment check - OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    const { email, phone, username, name } = req.body;
    
    // Validate required inputs
    if (!email && !phone && !username && !name) {
      return res.status(400).json({
        success: false,
        error: 'At least one input field (email, phone, username, or name) is required'
      });
    }

    // Initialize response structure
    const response = {
      success: true,
      data: {
        username: username || null,
        name: name || null,
        email: email || null,
        phone: {
          number: phone || null,
          validation: null,
          error: null
        },
        socialMedia: {
          platforms: [],
          totalPlatforms: 0,
          error: null
        },
        analysis: null,
        error: null
      }
    };

    // Phone validation (if phone provided)
    if (phone) {
      try {
        const apiUrl = 'http://apilayer.net/api/validate';
        const accessKey = process.env.PHONE_VALIDATION_API_KEY || 'cc802b8e8010ceb29f3f7f6284678a51';
        
        const phoneResponse = await fetch(`${apiUrl}?access_key=${accessKey}&number=${encodeURIComponent(phone)}`, {
          timeout: 10000 // 10 second timeout for phone validation
        });
        
        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          response.data.phone.validation = phoneData;
        } else {
          response.data.phone.error = `Phone validation API failed with status: ${phoneResponse.status}`;
        }
      } catch (phoneError) {
        console.error('Phone validation error:', phoneError);
        response.data.phone.error = phoneError.message;
      }
    }

    // Social media search (if username provided) - using only supported arguments
    if (username) {
      try {
        console.log('Running sherlock for username:', username);
        
        // Try different ways to run sherlock with only supported arguments
        let sherlockCommand = 'sherlock';
        let sherlockArgs = [
          username, 
          '--print-all',
          '--timeout', '5',  // 5 seconds per site
          '--nsfw'           // Include NSFW sites
        ];
        
        // Prefer invoking via installed CLI in the virtual environment
        const venvBin = path.join(process.cwd(), 'sherlock_project', 'sherlock_project', '.venv', 'bin');
        const sherlockCli = path.join(venvBin, 'sherlock');
        const pythonCli = path.join(venvBin, 'python');
        const sherlockScriptPath = path.join(process.cwd(), 'sherlock_project', 'sherlock_project', 'sherlock.py');

        console.log('Checking executables:', { sherlockCli, pythonCli, sherlockScriptPath });

        if (fs.existsSync(sherlockCli)) {
          console.log('Using sherlock CLI from venv');
          sherlockCommand = sherlockCli;
          sherlockArgs = [
            username,
            '--print-all',
            '--timeout', '5',
            '--nsfw'
          ];
        } else if (fs.existsSync(pythonCli) && fs.existsSync(sherlockScriptPath)) {
          console.log('Using venv python with sherlock.py');
          sherlockCommand = pythonCli;
          sherlockArgs = [
            sherlockScriptPath,
            username,
            '--print-all',
            '--timeout', '5',
            '--nsfw'
          ];
        } else {
          console.log('Falling back to PATH sherlock');
          sherlockCommand = 'sherlock';
          sherlockArgs = [
            username,
            '--print-all',
            '--timeout', '5',
            '--nsfw'
          ];
        }
        
        // Run sherlock with supported arguments only
        const sherlock = spawnSync(sherlockCommand, sherlockArgs, { 
          encoding: 'utf-8',
          timeout: 30000, // 30 second total timeout
          cwd: process.cwd(),
          killSignal: 'SIGTERM',
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        console.log('Sherlock stdout length:', sherlock.stdout?.length || 0);
        console.log('Sherlock stderr:', sherlock.stderr);
        console.log('Sherlock status:', sherlock.status);

        // Delete the generated file (username.txt)
        const outputFile = `${username}.txt`;
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }

        if (sherlock.error) {
          console.error('Sherlock error:', sherlock.error);
          if (sherlock.error.code === 'ENOENT') {
            response.data.socialMedia.error = 'Sherlock tool not found. Please install sherlock-project: pip install sherlock-project';
          } else if (sherlock.error.code === 'ETIMEDOUT') {
            // Even if it times out, try to parse any results we got
            console.log('Sherlock timed out, but checking for partial results...');
            if (sherlock.stdout && sherlock.stdout.length > 0) {
              const lines = sherlock.stdout.split('\n').filter(Boolean);
              const workingLinks = lines
                .filter(line => line.startsWith('[+]'))
                .map(line => {
                  const parts = line.split(': ');
                  return {
                    platform: parts[0].replace('[+]', '').trim(),
                    url: parts[1].trim()
                  };
                });
              
              if (workingLinks.length > 0) {
                response.data.socialMedia.platforms = workingLinks;
                response.data.socialMedia.totalPlatforms = workingLinks.length;
                response.data.socialMedia.error = `Search timed out but found ${workingLinks.length} profiles before timeout`;
                console.log('Found platforms before timeout:', workingLinks.length);
              } else {
                response.data.socialMedia.error = 'Sherlock search timed out. No profiles found before timeout.';
              }
            } else {
              response.data.socialMedia.error = 'Sherlock search timed out. No results available.';
            }
          } else {
            response.data.socialMedia.error = sherlock.error.message;
          }
        } else if (sherlock.status !== 0) {
          response.data.socialMedia.error = `Sherlock failed (status ${sherlock.status}): ${sherlock.stderr || sherlock.stdout || 'No error details available'}`;
        } else {
          // Parse working links
          const lines = sherlock.stdout.split('\n').filter(Boolean);
          const workingLinks = lines
            .filter(line => line.startsWith('[+]'))
            .map(line => {
              const parts = line.split(': ');
              return {
                platform: parts[0].replace('[+]', '').trim(),
                url: parts[1].trim()
              };
            });

          response.data.socialMedia.platforms = workingLinks;
          response.data.socialMedia.totalPlatforms = workingLinks.length;

          console.log('Found platforms:', workingLinks.length);
        }
      } catch (socialError) {
        console.error('Social media search error:', socialError);
        response.data.socialMedia.error = socialError.message;
      }
    }

    // Generate AI analysis regardless of results
    try {
      const analysisPrompt = `Analyze the following information about "${name || username || 'the person'}":
        
        Personal Information:
        - Name: ${name || 'Not provided'}
        - Email: ${email || 'Not provided'}
        - Phone: ${phone || 'Not provided'}
        - Username: ${username || 'Not provided'}
        
        Social Media Analysis:
        ${response.data.socialMedia.platforms.length > 0 
          ? `Found ${response.data.socialMedia.totalPlatforms} social media profiles:
             ${response.data.socialMedia.platforms.map(p => `- ${p.platform}: ${p.url}`).join('\n')}`
          : 'No social media profiles found or search failed'
        }
        
        Phone Validation:
        ${response.data.phone.validation 
          ? `Valid: ${response.data.phone.validation.valid ? 'Yes' : 'No'}
             Country: ${response.data.phone.validation.country_name || 'Unknown'}
             Carrier: ${response.data.phone.validation.carrier || 'Unknown'}`
          : 'Phone validation not available'
        }
        
        Please provide a comprehensive analysis of this person based on the available information. Include:
        1. Who this person might be
        2. Their digital footprint analysis
        3. Social media presence assessment
        4. Any notable patterns or insights
        5. Recommendations for further investigation if needed
        
        Be professional and factual in your analysis.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional investigator and digital forensics expert. Analyze the provided information and provide detailed, factual insights about the person\'s digital presence and identity.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      response.data.analysis = completion.choices[0].message.content;
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      response.data.analysis = `Analysis failed: ${analysisError.message}`;
    }

    // Generate PDF and return as base64 for inline display
    try {
      const doc = new PDFDocument();
      const chunks = [];
      
      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      
      // Add title
      doc.fontSize(20).text('Profile Analysis Report', { align: 'center' });
      doc.moveDown(2);
      
      // Add basic information
      doc.fontSize(16).text('Personal Information:', { underline: true });
      doc.fontSize(12);
      if (name) doc.text(`Name: ${name}`);
      if (email) doc.text(`Email: ${email}`);
      if (phone) doc.text(`Phone: ${phone}`);
      if (username) doc.text(`Username: ${username}`);
      doc.moveDown();
      
      // Add phone validation
      if (response.data.phone.validation) {
        doc.fontSize(16).text('Phone Validation:', { underline: true });
        doc.fontSize(12);
        const phoneData = response.data.phone.validation;
        doc.text(`Valid: ${phoneData.valid ? 'Yes' : 'No'}`);
        if (phoneData.country_name) doc.text(`Country: ${phoneData.country_name}`);
        if (phoneData.carrier) doc.text(`Carrier: ${phoneData.carrier}`);
        if (phoneData.line_type) doc.text(`Line Type: ${phoneData.line_type}`);
        doc.moveDown();
      }
      
      // Add social media platforms
      if (response.data.socialMedia.platforms && response.data.socialMedia.platforms.length > 0) {
        doc.fontSize(16).text('Social Media Platforms:', { underline: true });
        doc.fontSize(12);
        doc.text(`Total platforms found: ${response.data.socialMedia.totalPlatforms}`);
        doc.moveDown(0.5);
        
        response.data.socialMedia.platforms.forEach(platform => {
          doc.text(`${platform.platform}: ${platform.url}`, { link: platform.url });
        });
        doc.moveDown();
      }
      
      // Add AI analysis
      if (response.data.analysis) {
        doc.fontSize(16).text('Analysis:', { underline: true });
        doc.fontSize(12);
        doc.text(response.data.analysis, { align: 'justify' });
      }
      
      // Add error information if any
      if (response.data.phone.error || response.data.socialMedia.error) {
        doc.fontSize(16).text('Notes:', { underline: true });
        doc.fontSize(12);
        if (response.data.phone.error) doc.text(`Phone validation: ${response.data.phone.error}`);
        if (response.data.socialMedia.error) doc.text(`Social media search: ${response.data.socialMedia.error}`);
        doc.moveDown();
      }
      
      // Add timestamp
      doc.moveDown(2);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      
      // Finalize PDF and return as base64
      doc.end();
      
      // Wait for PDF to be generated
      await new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          const pdfBase64 = pdfBuffer.toString('base64');
          
          // Return JSON with PDF data and other information
          res.json({
            success: true,
            pdfData: `data:application/pdf;base64,${pdfBase64}`,
            inputs: response.data,
            timestamp: new Date().toISOString()
          });
          resolve();
        });
        
        doc.on('error', reject);
      });
      
    } catch (pdfError) {
      console.error('PDF Generation Error:', pdfError);
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report',
        details: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
      });
    }

  } catch (error) {
    console.error('Profile Analysis Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error while analyzing profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;