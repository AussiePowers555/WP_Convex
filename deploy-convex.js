const { execSync } = require('child_process');

// Set the environment variable for production deployment
process.env.CONVEX_DEPLOY_KEY = 'prod:keen-axolotl-228|eyJ2MiI6ImMyMGJjYjUzOTdhNDRlNmNiODc3NTdiZmY1YmFlOTQxIn0=';
// Force production environment for Convex
process.env.NODE_ENV = 'production';

try {
  console.log('Deploying Convex functions...');
  // Deploy with production flag and disable typecheck
  execSync('npx convex@1.25.2 deploy --prod --typecheck=disable', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('Convex deployed successfully!');
  
  console.log('Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
