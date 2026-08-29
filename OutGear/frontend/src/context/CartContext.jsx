import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Ambil data dari localStorage saat aplikasi pertama dimuat
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("outgear_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Simpan ke localStorage setiap kali state cart berubah
  useEffect(() => {
    localStorage.setItem("outgear_cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, mode, quantity = 1) {
    setCart((current) => {
      // Cek apakah produk dengan mode yang sama sudah ada
      const existing = current.find(
        (item) => item.productId === product.id && item.mode === mode,
      );

      if (existing) {
        return current.map((item) =>
          item.cartId === existing.cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          mode,
          quantity,
          price: mode === "rent" ? product.rentPrice : product.buyPrice,
          cartId: `${product.id}-${mode}-${Date.now()}`,
        },
      ];
    });
  }

  function removeFromCart(cartId) {
    setCart((current) => current.filter((item) => item.cartId !== cartId));
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, total, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
