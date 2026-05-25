import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import Header from "../components/Header";
import Toast from "../components/Toast";
import ProductCard from "../components/ProductCard";
import styles from "./Catalog.module.css";

export default function Catalog() {
  const dispatch = useDispatch();
  const { items: products, categories, status, error } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [toast, setToast] = useState("");

  const filtered = (selectedCategory
    ? products.filter((p) => p.categories?.some((c) => c.id === selectedCategory))
    : products
  )
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  const filteredCategories = categories
    .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      setToast(`${product.name}: нет в наличии`);
      setTimeout(() => setToast(""), 2000);
      return;
    }
    const existing = cartItems.find((i) => i.id === product.id);
    const currentQty = existing ? existing.qty : 0;
    if (currentQty + 1 > product.stock) {
      setToast(`${product.name}: на складе только ${product.stock} шт.`);
      setTimeout(() => setToast(""), 2000);
      return;
    }
    dispatch(addToCart(product));
    setToast(`${product.name}: теперь в корзине ${currentQty + 1} шт.`);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <>
      <Header />
      <div className="container">
        {status === "loading" && <h3 className="center">Загрузка...</h3>}
        {status === "failed" && <h3 className="center" style={{ color: "red" }}>{error}</h3>}

        {status === "succeeded" && (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <h3>Категории</h3>
              <input
                className={styles.sidebarSearch}
                placeholder="Поиск категории..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              <button
                className={`${styles.sidebarItem}${!selectedCategory ? ` ${styles.active}` : ""}`}
                onClick={() => setSelectedCategory(null)}
              >
                Все
              </button>
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.sidebarItem}${selectedCategory === cat.id ? ` ${styles.active}` : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </aside>

            <div className={styles.content}>
              <h1 className="center">Каталог товаров</h1>
              <input
                className={styles.productSearch}
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {filtered.length === 0 ? (
                <h3 className="center">Нет товаров</h3>
              ) : (
                <div className={styles.grid}>
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Toast message={toast} />
    </>
  );
}
