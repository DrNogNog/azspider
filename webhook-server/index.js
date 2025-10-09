require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' });

// Use raw body for webhook signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Helper function to update user subscription status
const updateUserSubscriptionStatus = async (customerEmail, isPaid, stripeCustomerId = null, subscriptionEndDate = null) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();

    if (error) {
      console.error('Supabase lookup error:', error);
      return;
    }

    if (data) {
      const updateData = { 
        is_paid: isPaid,
        updated_at: new Date().toISOString()
      };
      
      if (stripeCustomerId) {
        updateData.stripe_customer_id = stripeCustomerId;
      }
      
      if (subscriptionEndDate) {
        updateData.subscription_end_date = subscriptionEndDate;
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', data.id);
      
      console.log(`Updated ${customerEmail}: is_paid=${isPaid}, stripe_customer_id=${stripeCustomerId}`);
    } else {
      console.log('No profile found for', customerEmail);
    }
  } catch (err) {
    console.error('Error updating Supabase profile:', err);
  }
};

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received webhook event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email || null;
      
      if (customerEmail) {
        await updateUserSubscriptionStatus(customerEmail, true, session.customer);
      }
      break;

    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      const customerCreated = await stripe.customers.retrieve(subscriptionCreated.customer);
      
      if (customerCreated.email) {
        await updateUserSubscriptionStatus(
          customerCreated.email, 
          true, 
          subscriptionCreated.customer,
          new Date(subscriptionCreated.current_period_end * 1000).toISOString()
        );
      }
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      const customerUpdated = await stripe.customers.retrieve(subscriptionUpdated.customer);
      
      if (customerUpdated.email) {
        const isPaid = subscriptionUpdated.status === 'active';
        await updateUserSubscriptionStatus(
          customerUpdated.email, 
          isPaid, 
          subscriptionUpdated.customer,
          new Date(subscriptionUpdated.current_period_end * 1000).toISOString()
        );
      }
      break;

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      const customerDeleted = await stripe.customers.retrieve(subscriptionDeleted.customer);
      
      if (customerDeleted.email) {
        await updateUserSubscriptionStatus(customerDeleted.email, false, subscriptionDeleted.customer);
      }
      break;

    case 'invoice.payment_failed':
      const invoiceFailed = event.data.object;
      const customerFailed = await stripe.customers.retrieve(invoiceFailed.customer);
      
      if (customerFailed.email) {
        await updateUserSubscriptionStatus(customerFailed.email, false, invoiceFailed.customer);
      }
      break;

    case 'invoice.payment_succeeded':
      const invoiceSucceeded = event.data.object;
      const customerSucceeded = await stripe.customers.retrieve(invoiceSucceeded.customer);
      
      if (customerSucceeded.email) {
        await updateUserSubscriptionStatus(
          customerSucceeded.email, 
          true, 
          invoiceSucceeded.customer,
          new Date(invoiceSucceeded.period_end * 1000).toISOString()
        );
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
