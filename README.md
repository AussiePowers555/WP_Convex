# WP Convex - Motorbike Rental Management System

A comprehensive web application for managing motorbike rental cases, built with Next.js, Convex, and Clerk.

## 🚀 Features

### Core Functionality
- **Case Management**: Track rental cases from initiation to payment
- **Fleet Management**: Manage motorbike inventory and assignments
- **Financial Tracking**: Monitor invoices, payments, and outstanding amounts
- **Contact Management**: Organize lawyers, insurers, and rental companies
- **Multi-tenant Support**: Workspace-based data isolation
- **Real-time Updates**: Live data synchronization with Convex

### Dashboard
- Financial overview with key metrics
- Case status distribution charts
- Fleet availability tracking
- Recent cases monitoring
- Collection rate analytics

### Case Features
- NAF (Not-At-Fault) and AF (At-Fault) party management
- Automatic case number generation (WWMM### format)
- Status progression tracking
- Bike assignment workflow
- Financial summaries per case
- Australian-specific fields (states, postcodes)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Database**: Convex (real-time, serverless)
- **Authentication**: Clerk
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/AussiePowers555/WP_Convex.git
cd WP_Convex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# These will be added automatically by Convex
# CONVEX_DEPLOYMENT=
# NEXT_PUBLIC_CONVEX_URL=
```

4. Set up Convex:
```bash
npx convex dev
```
This will:
- Create a Convex project
- Add the Convex environment variables to `.env.local`
- Start the Convex development server

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment on Vercel

### Prerequisites
- GitHub repository connected
- Vercel account
- Convex account
- Clerk account

### Steps

1. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import the GitHub repository
   - Name it "WP-Convex"

2. **Configure Environment Variables in Vercel**:
   Add the following environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CONVEX_DEPLOY_KEY` (from Convex dashboard)
   - `NEXT_PUBLIC_CONVEX_URL` (from Convex dashboard)

3. **Set up Convex Production**:
```bash
npx convex deploy --cmd "npm run build"
```

4. **Configure Clerk Webhook** (if using):
   - In Convex dashboard, add `CLERK_WEBHOOK_SECRET` as environment variable
   - In Clerk dashboard, set webhook endpoint to your Convex HTTP endpoint

## 📁 Project Structure

```
├── app/
│   ├── dashboard/          # Protected dashboard area
│   │   ├── cases/         # Case management pages
│   │   ├── fleet/         # Fleet management (to be implemented)
│   │   └── page.tsx       # Main dashboard
│   └── layout.tsx         # Root layout with providers
├── components/
│   └── ui/               # shadcn/ui components
├── convex/
│   ├── schema.ts         # Database schema
│   ├── cases.ts          # Case CRUD operations
│   ├── bikes.ts          # Fleet management functions
│   ├── contacts.ts       # Contact management
│   └── workspaces.ts     # Workspace functions
└── lib/
    └── utils.ts          # Utility functions
```

## 🔐 Security

- Authentication handled by Clerk
- Role-based access control (admin, lawyer, rental_company, workspace_user)
- Workspace-based data isolation
- Secure API endpoints with authentication checks

## 🌏 Australian Localization

- Australian state selection (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
- AUD currency formatting
- Australian date format (DD/MM/YYYY)
- Postcode validation

## 📝 License

Private repository - All rights reserved

## 🤝 Contributing

Internal project - Please contact the repository owner for access

## 📧 Support

For support, email: aussie@whitepointer.com