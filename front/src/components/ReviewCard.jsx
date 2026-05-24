import styles from "./ReviewCard.module.css";

export default function ReviewCard({ review }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.author}>{review.user_name}</span>
        <span className={styles.stars}>
          {"★".repeat(review.rate)}{"☆".repeat(5 - review.rate)}
        </span>
      </div>
      <div className={styles.title}>{review.name}</div>
      <div className={styles.text}>{review.description}</div>
      <div className={styles.date}>{new Date(review.created_at).toLocaleString("ru-RU")}</div>
    </div>
  );
}
