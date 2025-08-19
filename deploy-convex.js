const { execSync } = require('child_process');

// Set the environment variable
process.env.CONVEX_DEPLOY_KEY = 'prod:keen-axolotl-228|eyJ2MiI6ImMyMGJjYjUzOTdhNDRlNmNiODc3NTdiZmY1YmFlOTQxIn0=';

try {
  console.log('Deploying Convex functions...');
  execSync('npx convex@1.25.2 deploy', { stdio: 'inherit' });
  console.log('Convex deployed successfully!');
  
  console.log('Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}