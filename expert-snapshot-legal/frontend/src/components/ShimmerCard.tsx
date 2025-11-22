import styles from '../styles/HomePage.module.css';

const ShimmerCard = () => {
  return (
    <div className={`${styles.retainerCard} ${styles.shimmerCard}`}>
      <div className={styles.shimmerIcon} />
      <div className={styles.shimmerText} />
    </div>
  );
};

export default ShimmerCard;

