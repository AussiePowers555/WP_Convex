# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 SaaS starter template with integrated authentication (Clerk), real-time database (Convex), and subscription billing (Clerk Billing).

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack on http://localhost:3000
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

### Convex Development
- `npx convex dev` - Start Convex development server (required for database)
- Run this in a separate terminal alongside `npm run dev`

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **Convex** for real-time database and serverless functions
- **Clerk** for authentication and user management
- **Clerk Billing** for subscription payments
- **TailwindCSS v4** with custom UI components (shadcn/ui)
- **TypeScript** throughout

### Key Architectural Patterns

#### Authentication Flow
1. Clerk handles all authentication via `middleware.ts`
2. JWT tokens are configured with "convex" template in Clerk dashboard
3. Users are synced to Convex via webhooks at `/api/clerk-users-webhook`
4. Protected routes redirect unauthenticated users to sign-in

#### Database Architecture
- **Convex** provides real-time sync and serverless functions
- Schema defined in `convex/schema.ts`:
  - `users` table: Synced from Clerk (externalId maps to Clerk ID)
  - `paymentAttempts` table: Tracks subscription payments
- All database operations in `convex/` directory

#### Payment Integration
1. Clerk Billing handles subscription management
2. Custom pricing component in `components/custom-clerk-pricing.tsx`
3. Payment-gated content uses `<ClerkBillingGate>` component
4. Webhook events update payment status in Convex

### Project Structure
```
app/
├── (landing)/         # Public landing page components
├── dashboard/         # Protected dashboard area
│   └── payment-gated/ # Subscription-only content
├── layout.tsx         # Root layout with providers
└── middleware.ts      # Auth protection

components/
├── ui/               # shadcn/ui components
├── custom-clerk-pricing.tsx
└── ConvexClientProvider.tsx

convex/
├── schema.ts         # Database schema
├── users.ts          # User CRUD operations
├── paymentAttempts.ts # Payment tracking
├── http.ts           # Webhook handlers
└── auth.config.ts    # JWT configuration
```

## Key Integration Points

### Environment Variables Required
- `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` (from Clerk JWT template)
- `CLERK_WEBHOOK_SECRET` (set in Convex dashboard)

### Clerk + Convex Setup Steps

#### 1. Clerk JWT Template Configuration
- In Clerk Dashboard, create a JWT template
- **CRITICAL**: Name it exactly `convex` (do NOT rename)
- Copy the Issuer URL (Format: `https://verb-noun-00.clerk.accounts.dev`)

#### 2. Convex Environment Variables
Set these in Convex Dashboard (https://dashboard.convex.dev/settings/environment-variables):
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` = The Issuer URL from Clerk JWT template
- `CLERK_WEBHOOK_SECRET` = Signing secret from Clerk webhook configuration

#### 3. Webhook Configuration
- **Convex HTTP Webhook URL**: `https://[your-deployment].convex.site/clerk-users-webhook`
- For this project: `https://keen-axolotl-228.convex.site/clerk-users-webhook`
- In Clerk Dashboard → Webhooks → Add Endpoint with this URL
- Select events: `user.created`, `user.updated`, `user.deleted`
- Copy the Signing Secret to use as `CLERK_WEBHOOK_SECRET`

#### 4. Auth Configuration
The `convex/auth.config.ts` file must reference the Clerk domain:
```typescript
export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ]
};
```

### Real-time Data Flow
1. UI components use Convex hooks (`useQuery`, `useMutation`)
2. Convex provides automatic real-time updates
3. Authentication context from `useAuth()` (Clerk)
4. User data synced between Clerk and Convex

## Shadcn Component Installation Rules
When installing shadcn/ui components:
- ALWAYS use `bunx --bun shadcn@latest add [component-name]` instead of `npx`
- If dependency installation fails, manually install with `bun install [dependency-name]`
- Check components.json for existing configuration before installing
- Verify package.json after installation to ensure dependencies were added
- Multiple components can be installed at once: `bunx --bun shadcn@latest add button card drawer`
