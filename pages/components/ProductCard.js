import styles from '../styles/Home.module.css';

const ProductCard = ({ product, onSelect }) => {
  return (
    <div className={styles.card} onClick={() => onSelect(product)}>
      <img src={product.image} alt={product.name} className={styles.productImage} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className={styles.price}>₹{product.price}</p>
      <button className={styles.buyButton}>Buy Now</button>
    </div>
  );
};

export default ProductCard;
