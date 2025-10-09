// Test frontend to backend connection
import fetch from 'node-fetch';

const testFrontendBackendConnection = async () => {
  console.log('Testing Frontend → Backend Connection\n');
  
  const backendUrl = 'https://ctmq2synkb.us-east-1.awsapprunner.com';
  const apiUrl = `${backendUrl}/api/search`;
  
  console.log('Backend URL:', backendUrl);
  console.log('API Endpoint:', apiUrl);
  console.log('');
  
  // Test the API call that your frontend makes
  try {
    console.log('1. Testing API call (same as frontend)...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        phone: '+1234567890',
        name: 'Test User'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Has PDF Data:', !!data.pdfData);
      console.log('Analysis Length:', data.analysis?.length || 0, 'characters');
      console.log('Social Media Error:', data.socialMedia?.error || 'None');
      console.log('');
      console.log('✅ Frontend → Backend connection is WORKING!');
    } else {
      console.log('❌ API call failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
  
  console.log('\n2. Testing CORS...');
  try {
    const corsResponse = await fetch(apiUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://azspider.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('CORS Status:', corsResponse.status);
    console.log('CORS Headers:', Object.fromEntries(corsResponse.headers.entries()));
  } catch (error) {
    console.log('CORS Error:', error.message);
  }
};

testFrontendBackendConnection().catch(console.error);


