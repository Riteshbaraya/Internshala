#!/usr/bin/env node

/**
 * Script to update CORS settings for your Vercel domain
 * Usage: node update-cors.js your-vercel-domain.vercel.app
 */

const fs = require('fs');
const path = require('path');

// Get the Vercel domain from command line arguments
const vercelDomain = process.argv[2];

if (!vercelDomain) {
    console.log("❌ Please provide your Vercel domain as an argument");
    console.log("Usage: node update-cors.js your-app-name.vercel.app");
    console.log("Example: node update-cors.js internarea.vercel.app");
    process.exit(1);
}

// Validate domain format
if (!vercelDomain.includes('.vercel.app') && !vercelDomain.includes('http')) {
    console.log("⚠️  Warning: Domain doesn't look like a Vercel domain");
    console.log("Expected format: your-app-name.vercel.app");
}

// Format the domain properly
const formattedDomain = vercelDomain.startsWith('http') 
    ? vercelDomain 
    : `https://${vercelDomain}`;

console.log("🔧 Updating CORS settings...");
console.log(`📝 Adding domain: ${formattedDomain}`);

// Read the current index.js file
const indexPath = path.join(__dirname, 'index.js');
let content = fs.readFileSync(indexPath, 'utf8');

// Check if domain is already in the allowedOrigins array
if (content.includes(formattedDomain)) {
    console.log("✅ Domain is already in CORS settings");
    process.exit(0);
}

// Find the allowedOrigins array and add the new domain
const allowedOriginsRegex = /const allowedOrigins = \[([\s\S]*?)\];/;
const match = content.match(allowedOriginsRegex);

if (!match) {
    console.log("❌ Could not find allowedOrigins array in index.js");
    process.exit(1);
}

// Add the new domain to the array
const currentOrigins = match[1];
const newOrigins = currentOrigins.trim() + 
    (currentOrigins.trim().endsWith(',') ? '' : ',') + 
    `\n  "${formattedDomain}"`;

// Replace the array
const newContent = content.replace(
    allowedOriginsRegex,
    `const allowedOrigins = [${newOrigins}\n];`
);

// Write the updated content back to the file
fs.writeFileSync(indexPath, newContent);

console.log("✅ CORS settings updated successfully!");
console.log("📋 Current allowed origins:");
console.log("   - http://localhost:3000");
console.log("   - https://intern-area-go6v.vercel.app");
console.log(`   - ${formattedDomain}`);

console.log("\n🚀 Next steps:");
console.log("1. Push these changes to GitHub");
console.log("2. Render will automatically redeploy");
console.log("3. Test your Vercel app to ensure CORS works");

// Also update the deployment guide
const guidePath = path.join(__dirname, '..', 'DEPLOYMENT_CONFIGURATION.md');
if (fs.existsSync(guidePath)) {
    let guideContent = fs.readFileSync(guidePath, 'utf8');
    
    // Update the example in the guide
    guideContent = guideContent.replace(
        /"https:\/\/your-app-name\.vercel\.app"/g,
        `"${formattedDomain}"`
    );
    
    fs.writeFileSync(guidePath, guideContent);
    console.log("📝 Updated deployment guide with your domain");
} 