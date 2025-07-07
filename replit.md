# Agent Marketplace - Replit Configuration

## Overview

This is a full-stack AI agent marketplace application built with Express.js, React, and PostgreSQL. Users can browse, purchase, and sell AI agents with different service packages. The application features user authentication through Replit's OIDC, a modern React frontend with shadcn/ui components, and a comprehensive backend API.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OIDC integration with Passport.js
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Design**: RESTful API with JSON responses

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Located in `shared/schema.ts` for type safety across frontend and backend
- **Migrations**: Managed through Drizzle Kit
- **Connection**: Neon Database serverless connection

## Key Components

### Authentication System
- **Provider**: Replit OIDC for seamless authentication
- **Session Storage**: PostgreSQL sessions table for persistence
- **User Management**: Automatic user creation/updates from OIDC claims
- **Protected Routes**: Middleware-based route protection

### Agent Management
- **Categories**: Predefined categories for organizing agents
- **Pricing Tiers**: Three-tier pricing (basic, standard, premium)
- **Reviews**: User review system with star ratings
- **Search & Filter**: Category-based filtering and text search

### E-commerce Features
- **Shopping Cart**: Session-based cart management
- **Order Processing**: Complete order lifecycle tracking
- **Payment Integration**: Structured for payment gateway integration
- **Seller Dashboard**: Tools for managing agent listings

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Loading States**: Skeleton loaders and optimistic updates
- **Error Handling**: Comprehensive error boundaries and toast notifications
- **Accessibility**: ARIA-compliant components from Radix UI

## Data Flow

1. **User Authentication**: Users authenticate via Replit OIDC, creating/updating user records
2. **Agent Browsing**: Frontend fetches agents with optional category/search filters
3. **Cart Management**: Items added to cart are stored in PostgreSQL with session association
4. **Order Processing**: Cart items converted to orders with status tracking
5. **Real-time Updates**: TanStack Query manages cache invalidation and optimistic updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **express**: Web framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **zod**: Schema validation

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **API Server**: Express server with hot reload via tsx
- **Database**: Neon Database with environment-based configuration

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Assets**: Served directly by Express in production
- **Environment Variables**: Database URL, session secrets, OIDC configuration

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed domains for OIDC
- **ISSUER_URL**: OIDC issuer URL (defaults to Replit)

## Changelog

```
Changelog:
- July 07, 2025. Enhanced platform with comprehensive features:
  * Added complete points system with earning, spending, and exchange for Naira
  * Implemented referral system with bonuses for signups, agent listings, and purchases
  * Created comprehensive notification system with real-time alerts for all events
  * Built leaderboard system for top sellers, buyers, and points leaders
  * Added loading spinners and improved user experience across all pages
  * Enhanced admin dashboard with points management and user oversight
  * Created About and Terms pages with professional content
  * Improved marketplace design with enhanced search and filtering
  * Added role-based navigation and automatic dashboard redirects
  * Created seller registration modal with professional application process
  * Fixed authentication flow and database connection issues
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Recent updates: Enhanced platform with toast notifications, improved marketplace design, comprehensive admin system, and role-based navigation.
```