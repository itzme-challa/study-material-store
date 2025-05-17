import crypto from 'crypto';

// Verify webhook signature
const verifySignature = (signature, body, secret) => {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return signature === generatedSignature;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-cf-signature'];

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifySignature(signature, rawBody, process.env.CASHFREE_WEBHOOK_SECRET)) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    console.log('Payment webhook received:', {
      orderId: event?.order?.order_id,
      status: event?.order?.status,
      amount: event?.order?.order_amount
    });

    // Handle different payment statuses
    switch (event?.order?.status) {
      case 'PAID':
        // 1. Update database
        // 2. Send confirmation email
        // 3. Fulfill order
        console.log(`Order ${event.order.order_id} paid successfully`);
        break;
      
      case 'FAILED':
        console.error(`Payment failed for order ${event.order.order_id}`);
        break;
      
      case 'EXPIRED':
        console.warn(`Order ${event.order.order_id} expired`);
        break;
    }

    return res.status(200).json({ status: 'WEBHOOK_PROCESSED' });
  } catch (error) {
    console.error('Webhook processing error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
}
