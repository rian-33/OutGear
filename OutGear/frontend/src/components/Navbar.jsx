import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { cart } = useCart();

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        SummitGear
      </Link>
      <nav>
        <Link to="/">Home</Link>
        <a href="#about">About Us</a>
        <Link to="/products">Produk</Link>
        <a href="#services">Services</a>
        <Link to="/checkout">Pesan Sekarang ({cart.length})</Link>
      </nav>
    </header>
  );
}
