import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-webhook-signature'];
    const body = JSON.stringify(req.body);
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
      .update(body)
      .digest('base64');

    if (signature !== generatedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { orderId, orderAmount, referenceId, txStatus, paymentMode } = req.body;

    if (txStatus === 'PAID') {
      // Here you would typically:
      // 1. Update your database with the payment status
      // 2. Trigger delivery (e.g., send email, Telegram message)
      console.log(`Payment successful for order ${orderId}`);
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
