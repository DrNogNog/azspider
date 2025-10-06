// Test script for App Runner backend
import fetch from 'node-fetch';

const testAppRunner = async () => {
  const baseUrl = 'https://ctmq2synkb.us-east-1.awsapprunner.com';
  
  console.log('Testing App Runner backend...\n');
  
  // Test 1: Root endpoint
  console.log('1. Testing root endpoint (/)');
  try {
    const response = await fetch(`${baseUrl}/`);
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n2. Testing health endpoint (/health)');
  try {
    const response = await fetch(`${baseUrl}/health`);
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n3. Testing API endpoint (/api/search)');
  try {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'test' })
    });
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n4. Testing with different paths');
  const paths = ['/api', '/api/', '/v1', '/v1/health', '/status'];
  
  for (const path of paths) {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      console.log(`${path}: ${response.status} - ${await response.text()}`);
    } catch (error) {
      console.log(`${path}: Error - ${error.message}`);
    }
  }
};

testAppRunner().catch(console.error);
