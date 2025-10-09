// Detailed test for Sherlock Python execution
import fetch from 'node-fetch';

const testSherlockExecution = async () => {
  console.log('Testing Sherlock Python Execution...\n');
  
  const backendUrl = 'https://ctmq2synkb.us-east-1.awsapprunner.com';
  const apiUrl = `${backendUrl}/api/search`;
  
  // Test with a username that should trigger Sherlock
  const testData = {
    username: 'testuser123',
    email: 'test@example.com',
    phone: '+1234567890',
    name: 'Test User'
  };
  
  try {
    console.log('Sending request with username:', testData.username);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n=== RESPONSE ANALYSIS ===');
      console.log('Success:', data.success);
      console.log('Has PDF Data:', !!data.pdfData);
      console.log('PDF Data Length:', data.pdfData?.length || 0);
      
      if (data.inputs) {
        console.log('\n=== INPUTS ===');
        console.log('Username:', data.inputs.username);
        console.log('Email:', data.inputs.email);
        console.log('Phone:', data.inputs.phone);
        
        if (data.inputs.socialMedia) {
          console.log('\n=== SOCIAL MEDIA ===');
          console.log('Platforms Found:', data.inputs.socialMedia.platforms?.length || 0);
          console.log('Total Platforms:', data.inputs.socialMedia.totalPlatforms);
          console.log('Error:', data.inputs.socialMedia.error || 'None');
          
          if (data.inputs.socialMedia.error) {
            console.log('\n🔍 SHERLOCK ERROR DETAILS:');
            console.log(data.inputs.socialMedia.error);
          }
        }
      }
      
      if (data.analysis) {
        console.log('\n=== ANALYSIS ===');
        console.log('Analysis Length:', data.analysis.length);
        console.log('Analysis Preview:', data.analysis.substring(0, 200) + '...');
      }
      
      console.log('\n=== TIMESTAMP ===');
      console.log('Generated at:', data.timestamp);
      
    } else {
      console.log('❌ Request failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
};

testSherlockExecution().catch(console.error);


