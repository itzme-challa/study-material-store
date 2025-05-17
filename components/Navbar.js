import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.navBrand}>
          StudyMaterialStore
        </Link>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/#products">Products</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
