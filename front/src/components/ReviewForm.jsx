import { useState } from "react";
import { createReview } from "../api/reviews";
import StarRating from "./StarRating";
import styles from "./ReviewForm.module.css";

export default function ReviewForm({ productId, onReviewAdded }) {
  const [form, setForm] = useState({ user_name: "", name: "", description: "", rate: 0 });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.user_name.trim() || !form.name.trim() || !form.description.trim()) {
      setError("Заполните все поля");
      return;
    }
    if (form.rate === 0) {
      setError("Выберите оценку");
      return;
    }

    setSending(true);
    try {
      const created = await createReview({ ...form, product_id: productId });
      onReviewAdded(created);
      setForm({ user_name: "", name: "", description: "", rate: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.form}>
      <h3>Оставить отзыв</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Ваше имя"
          value={form.user_name}
          onChange={(e) => setForm({ ...form, user_name: e.target.value })}
        />
        <input
          placeholder="Заголовок отзыва"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className={styles.textarea}
          placeholder="Ваш отзыв"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className={styles.label}>Оценка:</label>
        <StarRating value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={sending}>
          {sending ? "Отправка..." : "Отправить отзыв"}
        </button>
      </form>
    </div>
  );
}
