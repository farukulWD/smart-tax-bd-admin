# Smart Tax BD Admin - Project Overview

## 📌 Project Description
The administrative dashboard for Smart Tax BD. It allows administrators to manage users, process tax filings, monitor payments, and oversee the platform's operations.

## 🛠 Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **State Management**: Redux Toolkit (RTK Query for API calls)
- **UI Components**: Radix UI (Primitives), Lucide React (Icons)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts (for data visualization)

## 📂 Key Directory Structure
- `src/app/`: Next.js App Router routes.
  - `admin/`: Primary dashboard and management routes.
- `src/components/`: UI components.
  - `ui/`: Base UI components (Buttons, Inputs, etc.).
  - `layouts/`: Admin-specific layout components.
- `src/redux/`: Redux store and API service definitions.
- `src/lib/`: Shared utilities and library configurations.
- `src/types/`: TypeScript definitions.
- `src/helpers/`: Utility and formatting functions.

## 🚀 Key Features
- **Admin Authentication**: Secure login for administrators.
- **User Management**: View, edit, and manage platform users.
- **Tax Processing**: Review and approve user tax filings.
- **Transaction Monitoring**: Track payments and financial activities.
- **Analytics Dashboard**: Visual representation of platform metrics using Recharts.

## 📜 Available Commands
- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs ESLint for code quality checks.

## 📝 Important Notes for AI Agents
- The admin dashboard uses a structure similar to the client but with admin-specific features.
- Ensure all admin actions are properly authorized via Redux hooks and API checks.
- Data visualization is handled by Recharts; refer to existing chart components for patterns.
