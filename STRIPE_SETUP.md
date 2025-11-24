# Stripe Payment Integration Setup Guide

## Overview
A complete Stripe payment integration has been implemented for purchasing subscription plans. Users can view plans publicly, but must be logged in to purchase.

## Features Implemented

1. **Public Plan Viewing**: All users can view available plans without authentication
2. **Authentication Check**: Users must be logged in to purchase plans
3. **Stripe Checkout**: Secure payment processing via Stripe Checkout
4. **Webhook Handling**: Automatic subscription activation upon successful payment
5. **Order Management**: Complete order tracking in database
6. **Success/Cancel Pages**: User-friendly redirect pages after payment

## Prerequisites

### 1. Install Dependencies
Stripe package is already installed:
```bash
npm install stripe
```

### 2. Stripe Account Setup

1. **Create a Stripe Account**: Sign up at [https://stripe.com](https://stripe.com)
2. **Get API Keys**: 
   - Go to Developers → API keys
   - Copy your **Publishable key** and **Secret key**
   - For testing, use test mode keys
3. **Set Up Webhook**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded` (optional backup)
   - Copy the **Webhook signing secret**

### 3. Environment Variables

Add the following to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Your webhook signing secret

# Application URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

**Important**: 
- Use test keys (`sk_test_...`) for development
- Use live keys (`sk_live_...`) for production
- Update `NEXT_PUBLIC_APP_URL` to your production domain

## How It Works

### Purchase Flow

1. **User Views Plans**: Public page at `/plan` shows all active plans
2. **User Clicks "Get Started"**: 
   - If not logged in: Shows toast "Please login to purchase a plan" with login button
   - If logged in: Creates Stripe checkout session
3. **Stripe Checkout**: User redirected to Stripe's secure payment page
4. **Payment Success**: 
   - Stripe sends webhook to `/api/webhooks/stripe`
   - Webhook creates subscription and updates order status
   - User redirected to `/checkout/success`
5. **Payment Cancel**: User redirected to `/checkout/cancel`

### Database Updates

When payment is successful:
- **Order** table: Status updated to `PAID`, linked to subscription
- **Subscription** table: New active subscription created with plan quotas
- Existing active subscriptions are automatically canceled

## API Routes

### `/api/checkout/create` (POST)
- **Auth Required**: Yes
- **Body**: `{ planId: number }`
- **Returns**: `{ sessionId, url, orderId }`
- Creates Stripe checkout session and order record

### `/api/webhooks/stripe` (POST)
- **Auth Required**: No (uses Stripe signature verification)
- **Body**: Raw Stripe webhook payload
- Handles `checkout.session.completed` event
- Creates subscription and updates order

## Frontend Components

### `src/app/plan/page.tsx`
- Public plans page with authentication check
- Uses `useAuth` hook to check login status
- Handles checkout session creation

### `src/hooks/useAuth.ts`
- React hook to check authentication status
- Returns `{ user, isAuthenticated, loading }`

### `src/app/checkout/success/page.tsx`
- Success page after payment
- Shows confirmation message

### `src/app/checkout/cancel/page.tsx`
- Cancel page if payment is cancelled
- Allows user to try again

## Testing

### Test Mode
1. Use Stripe test keys
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and CVC
3. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Production
1. Switch to live Stripe keys
2. Update `NEXT_PUBLIC_APP_URL` to production domain
3. Configure webhook endpoint in Stripe dashboard
4. Test with real payment (small amount)

## Security Features

- ✅ Authentication required for purchases
- ✅ JWT token verification
- ✅ Stripe webhook signature verification
- ✅ Database transactions for data consistency
- ✅ Order tracking for audit trail
- ✅ Automatic subscription management

## Troubleshooting

### Webhook Not Working
- Check webhook secret in environment variables
- Verify webhook endpoint URL in Stripe dashboard
- Check server logs for errors
- Use Stripe CLI for local testing

### Payment Succeeds But Subscription Not Created
- Check webhook logs in Stripe dashboard
- Verify database connection
- Check order status in database
- Review webhook handler logs

### Authentication Issues
- Verify JWT_SECRET is set
- Check cookie settings
- Ensure user is logged in before purchase

## Support

For issues or questions:
1. Check Stripe dashboard for payment status
2. Review server logs
3. Check database for order/subscription records
4. Verify environment variables are set correctly

