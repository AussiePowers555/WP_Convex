# Clerk + Convex Integration Setup Guide

## Overview
Setting up Clerk with Convex involves configuring both services to work together for authentication and user management within your application. The core steps are as follows:

## Setup Steps

### 1. Create a Clerk Application and JWT Template
- Sign up for a free Clerk account and create a new application
- In the Clerk Dashboard, navigate to the JWT templates page and create a new template specifically for Convex
- Clerk provides a pre-configured "Convex" template, which is recommended
- **Crucially, note down the "Issuer URL" from this Convex JWT template** as it will be needed for Convex configuration

### 2. Configure Convex with Clerk's Issuer URL
- In your Convex project, access the Convex Dashboard and go to "Settings" -> "Environment Variables"
- Create a new environment variable named `CLERK_JWT_ISSUER_DOMAIN` and set its value to the "Issuer URL" copied from the Clerk Convex JWT template
- For this project, also add:
  - `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`: The Frontend API URL from your Clerk dashboard
  - `CLERK_WEBHOOK_SECRET`: The webhook secret for syncing user data

### 3. Integrate ConvexProviderWithClerk in your Application
- In your client-side application (e.g., React, Next.js), use the `ConvexProviderWithClerk` component from the Convex SDK to wrap your application's root component
- This provider facilitates the seamless passing of Clerk authentication data to Convex
- Ensure you pass your Convex client and Clerk's publishable key to this provider

### 4. Optional: Implement Clerk Webhooks for Data Sync
- To keep user data synchronized between Clerk and Convex (e.g., when a user signs up or updates their profile), configure a Clerk webhook
- Point this webhook to a Convex HTTP Action
- In the Convex HTTP Action, parse the webhook payload and use Convex mutations to update or create user records in your Convex database

## Current Project Status

### ✅ Completed
- Clerk application created
- JWT template configured
- ConvexProviderWithClerk integrated in the application
- Webhook endpoints created in `convex/http.ts`
- User sync mutations implemented in `convex/users.ts`

### ⚠️ Pending Actions Required
1. **Set Convex Environment Variables** (Required for deployment):
   - Go to: https://dashboard.convex.dev/d/keen-axolotl-228/settings/environment-variables
   - Add: `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` = `https://ready-sculpin-43.clerk.accounts.dev`
   - Add: `CLERK_WEBHOOK_SECRET` = (get from Clerk dashboard)

2. **Configure Clerk Webhooks**:
   - In Clerk Dashboard, set up webhook endpoint
   - Point to your Convex HTTP action URL
   - Select events: `user.created`, `user.updated`, `user.deleted`

## Environment Variables Reference

### Already Set in Vercel:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CONVEX_DEPLOY_KEY`
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`

### Need to be Set in Convex Dashboard:
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
- `CLERK_WEBHOOK_SECRET`

By following these steps, you establish a secure and efficient integration between Clerk for user authentication and Convex for real-time data management, allowing your application to leverage both services effectively.