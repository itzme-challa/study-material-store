import { useState } from 'react';
import Modal from 'react-modal';
import styles from '../styles/Home.module.css';

Modal.setAppElement('#__next');

const CheckoutModal = ({ isOpen, onClose, product, onPayment, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <h2>Checkout: {product?.name}</h2>
      <p>Price: ₹{product?.price}</p>
      
      <form onSubmit={handleSubmit} className={styles.checkoutForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[6-9]{1}[0-9]{9}"
            required
          />
          <small>10-digit Indian phone number</small>
        </div>
        
        <div className={styles.buttonGroup}>
          <button type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : `Pay ₹${product?.price}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckoutModal;
