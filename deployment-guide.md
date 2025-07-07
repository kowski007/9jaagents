# Deployment Guide

## Database Architecture

### Technology Stack
- **PostgreSQL** - Production-grade relational database
- **Drizzle ORM** - Type-safe database operations with TypeScript
- **Neon Database** - Serverless PostgreSQL hosting (recommended for deployment)

### Database Structure
The platform uses 15+ interconnected tables:

**Core Tables:**
- `users` - Authentication, roles (user/seller/admin), earnings, points
- `categories` - Agent categories (Writing, Coding, Design, etc.)
- `agents` - AI agent listings with 4 pricing tiers (Free, Basic, Standard, Premium)
- `orders` - Purchase transactions and order management
- `reviews` - Agent ratings and feedback system

**Financial System:**
- `wallets` - User balance tracking
- `wallet_transactions` - Complete transaction history
- `withdrawal_requests` - Bank transfer requests from sellers
- `admin_commissions` - Platform revenue tracking (10% commission)

**Engagement Features:**
- `points_history` - Loyalty/rewards point tracking
- `notifications` - Real-time user alerts
- `cart_items` - Shopping cart management
- `favorites` - User's saved agents
- `sessions` - Secure authentication storage

## Deployment Options

### Option 1: Vercel Deployment

1. **Setup Neon Database:**
   ```bash
   # Create account at https://neon.tech
   # Create new project
   # Copy DATABASE_URL from dashboard
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables in Vercel:**
   - `DATABASE_URL` - Your Neon database connection string
   - `PAYSTACK_SECRET_KEY` - Your Paystack secret key
   - `PAYSTACK_PUBLIC_KEY` - Your Paystack public key
   - `SESSION_SECRET` - Random string for session encryption
   - `NODE_ENV=production`
   - `BASE_URL` - Your Vercel domain

4. **Database Migration:**
   ```bash
   npm run db:push
   ```

### Option 2: Netlify Deployment (Recommended)

1. **Database Already Connected:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_jXWv7n8HdKsE@ep-sweet-band-adj9xeod-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

2. **Deploy to Netlify:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Environment Variables in Netlify Dashboard:**
   - `DATABASE_URL` - Your Neon database (see above)
   - `PAYSTACK_SECRET_KEY` - Your Paystack secret key
   - `PAYSTACK_PUBLIC_KEY` - Your Paystack public key
   - `SESSION_SECRET` - Random string for session encryption
   - `NODE_ENV=production`
   - `BASE_URL` - Your Netlify domain

### Required Environment Variables

```env
DATABASE_URL=postgresql://username:password@host:port/database
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
SESSION_SECRET=your_random_session_secret
NODE_ENV=production
BASE_URL=https://your-domain.com
```

## Payment System Setup

### Paystack Integration
1. Create account at https://paystack.com
2. Get API keys from dashboard
3. Configure webhook URL: `https://your-domain.com/api/agents/purchase/callback`
4. Test with test keys first, then switch to live keys

### Payment Flow
1. **Customer Purchase** → Paystack processes payment
2. **Automatic Split** → 90% to seller wallet, 10% platform commission
3. **Seller Withdrawal** → Request bank transfer via admin approval
4. **Real Bank Transfer** → Admin processes actual bank transfers

## Database Management

### Schema Updates
```bash
# Push schema changes to database
npm run db:push

# This automatically updates the database structure
# No manual SQL migrations needed
```

### Sample Data
The platform automatically creates:
- Default categories (Writing, Coding, Design, Analytics, etc.)
- Sample agents for demonstration
- Admin user for testing

## Security Features

### Authentication
- Replit OAuth integration
- Secure session management
- Role-based access control (user/seller/admin)

### Financial Security
- Admin approval for withdrawals
- Transaction audit trails
- Commission tracking
- Wallet balance validation

## Monitoring & Maintenance

### Database Health
- Connection pooling via Neon
- Automatic backups
- Query performance monitoring

### Application Monitoring
- Error logging
- Payment webhook monitoring
- User activity tracking

## Post-Deployment Checklist

1. ✅ Database connected and migrated
2. ✅ Paystack webhooks configured
3. ✅ Environment variables set
4. ✅ Test payment flow
5. ✅ Create admin user
6. ✅ Test withdrawal process
7. ✅ Monitor error logs

## Support & Maintenance

### Regular Tasks
- Monitor withdrawal requests
- Review platform commissions
- Check payment webhook logs
- Update agent categories as needed

### Scaling Considerations
- Database connection limits (Neon handles automatically)
- Payment processing limits (upgrade Paystack plan)
- User upload limits (consider CDN for images)