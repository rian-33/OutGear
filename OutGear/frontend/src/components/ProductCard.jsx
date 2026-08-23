import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="product">
      <div className="product-image">🏕️</div>
      <span>{product.category}</span>
      <h3>{product.name}</h3>
      <p>
        Sewa: <b>Rp {product.rentPrice.toLocaleString("id-ID")}/hari</b>
      </p>
      <p>
        Beli: <b>Rp {product.buyPrice.toLocaleString("id-ID")}</b>
      </p>
      <div className="actions">
        <button onClick={() => addToCart(product, "rent")}>Tambah Sewa</button>
        <button onClick={() => addToCart(product, "buy")}>Tambah Beli</button>
      </div>
    </article>
  );
}
