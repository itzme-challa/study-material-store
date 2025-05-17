export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const event = req.body;
    console.log('Payment webhook received:', JSON.stringify(event, null, 2));

    // Verify signature (recommended for production)
    // const signature = req.headers['x-cf-signature'];
    // verifySignature(signature, JSON.stringify(event), process.env.CASHFREE_WEBHOOK_SECRET);

    if (event?.order?.status === 'PAID') {
      console.log(`Payment successful for order: ${event.order.order_id}`);
      // Here you would typically:
      // 1. Update your database
      // 2. Send confirmation email
      // 3. Fulfill the order
    }

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
}
