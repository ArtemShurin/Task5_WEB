import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadProducts } from "../store/productsSlice";
import { addToCartWithQty } from "../store/cartSlice";
import { fetchReviewsByProduct } from "../api/reviews";
import Header from "../components/Header";
import Toast from "../components/Toast";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import styles from "./Product.module.css";

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { items, status, error } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);
  const product = items.find((p) => p.id === id);

  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (status === "idle") dispatch(loadProducts());
  }, [status, dispatch]);

  useEffect(() => {
    fetchReviewsByProduct(id)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!product || product.stock === 0) {
      setToast("Товар отсутствует на складе");
      setTimeout(() => setToast(""), 2000);
      return;
    }
    const existing = cartItems.find((item) => item.id === product.id);
    const currentQty = existing ? existing.qty : 0;
    if (currentQty + qty > product.stock) {
      const available = product.stock - currentQty;
      setToast(
        available > 0
          ? `Можно добавить ещё не более ${available} шт.`
          : `${product.name}: на складе только ${product.stock} шт.`
      );
      setTimeout(() => setToast(""), 2000);
      return;
    }
    dispatch(addToCartWithQty({ product, qty }));
    setToast(`${product.name}: теперь в корзине ${currentQty + qty} шт.`);
    setTimeout(() => setToast(""), 2000);
    setAdded(true);
  };

  if (status === "loading" || (status === "idle" && !product))
    return <h2 className="center">Загрузка...</h2>;
  if (status === "failed")
    return <h2 className="center" style={{ color: "red" }}>{error}</h2>;
  if (!product)
    return <h2 className="center" style={{ color: "red" }}>Товар не найден</h2>;

  return (
    <>
      <Header />
      <div className="container">
        <div className={styles.productPage}>
          <div className={styles.productBox}>
            <img
              className={styles.img}
              src={product.image_url || "https://via.placeholder.com/300x200?text=Товар"}
              alt={product.name}
            />
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <h3>{product.price} $</h3>
            {!reviewsLoading && reviews.length > 0 && (
              <p className={styles.rating}>
                ★ {(reviews.reduce((s, r) => s + r.rate, 0) / reviews.length).toFixed(1)}
                <span className={styles.ratingCount}> ({reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"})</span>
              </p>
            )}
            <p style={{ color: product.stock > 0 ? "green" : "red" }}>
              {product.stock > 0 ? `В наличии: ${product.stock} шт.` : "Нет в наличии"}
            </p>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ marginBottom: "15px" }}
            />
            <button onClick={addToCart} disabled={product.stock === 0}>Купить</button>
            {added && (
              <>
                <br /><br />
                <Link to="/cart"><button>Перейти в корзину</button></Link>
              </>
            )}
            <br /><br />
            <Link to="/"><button>Обратно в каталог</button></Link>
          </div>
        </div>

        <div className={styles.reviewsSection}>
          <h2>Отзывы</h2>
          {reviewsLoading ? (
            <p className="center" style={{ color: "#888" }}>Загрузка отзывов...</p>
          ) : reviews.length === 0 ? (
            <p className="center" style={{ color: "#888" }}>Отзывов пока нет. Будьте первым!</p>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
          <ReviewForm productId={id} onReviewAdded={(r) => setReviews((prev) => [r, ...prev])} />
        </div>
      </div>
      <Toast message={toast} />
    </>
  );
}
