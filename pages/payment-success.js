import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const products = {
  'master-the-ncert-bio-12th': {
    name: 'Master the NCERT Biology 12th',
    telegramLink: 'https://t.me/Material_eduhubkmrbot'
  },
  'master-the-ncert-bio-11th': {
    name: 'Master the NCERT Biology 11th',
    telegramLink: 'https://t.me/Material_eduhubkmrbot'
  },
  'disha-144-jee-mains-physics': {
    name: 'Disha 144 JEE Mains Physics',
    telegramLink: 'https://t.me/Material_eduhubkmrbot'
  }
};

export default function PaymentSuccess() {
  const router = useRouter();
  const { order_id, product_id } = router.query;
  const product = product_id ? products[product_id] : null;

  useEffect(() => {
    if (order_id && product_id && product) {
      // Redirect to Telegram bot with payment confirmation
      setTimeout(() => {
        window.location.href = `${product.telegramLink}?start=${order_id}_${product_id}`;
      }, 3000);
    }
  }, [order_id, product_id, product]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Payment Successful | Study Material Store</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Payment Successful!</h1>
        
        {product ? (
          <>
            <p className={styles.description}>
              Thank you for purchasing {product.name}. Your order ID is {order_id}.
            </p>
            <p>You will be redirected to Telegram shortly to receive your study material.</p>
          </>
        ) : (
          <p className={styles.description}>
            Thank you for your payment. Your order ID is {order_id}.
          </p>
        )}
      </main>
    </div>
  );
}
