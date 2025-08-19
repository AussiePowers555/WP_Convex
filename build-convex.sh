#!/bin/bash
export CONVEX_DEPLOY_KEY="prod:keen-axolotl-228|eyJ2MiI6ImMyMGJjYjUzOTdhNDRlNmNiODc3NTdiZmY1YmFlOTQxIn0="
npx convex@1.25.2 deploy
npm run build