// Simple script to check .env file configuration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try {
  // Get the directory name using ES modules approach
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Try to read the .env file
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);
  
  console.log('=== ENV FILE CHECK ===');
  console.log(`File exists: ${envExists ? 'Yes' : 'No'}`);
  
  if (envExists) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    console.log(`Number of lines: ${lines.length}`);
    
    // Check for specific environment variables without showing values
    const variables = {};
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') return;
      
      // Extract variable name
      const match = line.match(/^([^=]+)=/);
      if (match && match[1]) {
        const varName = match[1].trim();
        const value = line.substring(match[0].length);
        variables[varName] = value;
        
        // Show first few characters of value to help with debugging
        const displayValue = value.length > 0 
          ? value.substring(0, 3) + '...' + (value.length > 10 ? '[' + (value.length - 6) + ' more chars]' : '')
          : '[empty]';
          
        console.log(`${varName}: ${displayValue}`);
      }
    });
    
    // Check specific required variables
    console.log('\nRequired variables check:');
    console.log(`VITE_SUPABASE_URL: ${variables.VITE_SUPABASE_URL ? 'Present' : 'Missing'}`);
    console.log(`VITE_SUPABASE_ANON_KEY: ${variables.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`);
    
    // Check URL format if present
    if (variables.VITE_SUPABASE_URL) {
      const url = variables.VITE_SUPABASE_URL;
      console.log('\nURL format check:');
      console.log(`Starts with https://: ${url.startsWith('https://') ? 'Yes' : 'No'}`);
      console.log(`Contains .supabase.co: ${url.includes('.supabase.co') ? 'Yes' : 'No'}`);
      console.log(`Ends with trailing slash: ${url.endsWith('/') ? 'Yes' : 'No'}`);
      
      // Check for common issues
      if (!url.startsWith('https://')) {
        console.log('WARNING: Supabase URL should start with https://');
      }
      if (!url.includes('.supabase.co')) {
        console.log('WARNING: Supabase URL should contain .supabase.co');
      }
      if (url.endsWith('/')) {
        console.log('WARNING: Supabase URL should not end with a trailing slash');
      }
    }
  } else {
    console.log('No .env file found. Please create one with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
} catch (error) {
  console.error('Error checking .env file:', error);
} 