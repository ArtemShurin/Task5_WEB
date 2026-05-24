import { useState } from "react";
import styles from "./StarRating.module.css";

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={styles.rating}>
      {STARS.map((s) => (
        <button
          key={s}
          type="button"
          className={`${styles.star}${s <= (hovered || value) ? ` ${styles.active}` : ""}`}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
