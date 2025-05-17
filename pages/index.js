import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import CheckoutModal from '../components/CheckoutModal';
import styles from '../styles/Home.module.css';

const products = [
  {
    id: 'master-the-ncert-bio-12th',
    name: 'Master the NCERT Biology 12th',
    price: 299,
    description: 'Complete NCERT Class 12 Biology material',
    image: '/products/master-the-ncert-bio-12th.jpg',
    telegramLink: 'https://t.me/Material_eduhubkmrbot'
  },
  {
    id: 'master-the-ncert-bio-11th',
    name: 'Master the NCERT Biology 11th',
    price: 299,
    description: 'Complete NCERT Class 11 Biology material',
    image: '/products/master-the-ncert-bio-11th.jpg',
    telegramLink: 'https://t.me/Material_eduhubkmrbot'
  },
  {
    id: 'disha-144-jee-mains-physics',
    name: 'Disha 144 JEE Mains Physics',
    price: 399,
    description: '144 important Physics questions for JEE Mains',
    image: '/products/disha-144-jee-mains-physics.jpg',
    telegramLink: 'https://t.me/Material_eduhubkmrbot'
  }
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handlePayment = async (customerDetails) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/create-order', {
        productId: selectedProduct.id,
        amount: selectedProduct.price,
        ...customerDetails
      });
      window.location.href = response.data.payment_link;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Study Material Store | NEET/JEE Preparation</title>
        <meta name="description" content="Premium study materials for NEET and JEE aspirants" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Premium Study Materials</h1>
        <p className={styles.description}>Digital resources for NEET/JEE preparation</p>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onSelect={handleProductSelect}
            />
          ))}
        </div>
      </main>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onPayment={handlePayment}
        isLoading={isLoading}
      />
    </div>
  );
}
