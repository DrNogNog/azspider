#!/usr/bin/env node

// Build script that ensures environment variables are available
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from production.env
const envPath = path.join(__dirname, '..', 'production.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Set environment variables
  Object.assign(process.env, envVars);
  console.log('Loaded environment variables from production.env');
} else {
  console.log('production.env not found, using system environment variables');
}

// Run the build
console.log('Building with environment variables...');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
