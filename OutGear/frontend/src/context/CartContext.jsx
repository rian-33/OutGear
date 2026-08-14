import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(product, mode) {
    setCart((current) => [
      ...current,
      { ...product, mode, cartId: `${product.id}-${mode}-${Date.now()}` },
    ]);
  }

  function removeFromCart(cartId) {
    setCart((current) => current.filter((item) => item.cartId !== cartId));
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + (item.mode === "rent" ? item.rentPrice : item.buyPrice),
    0,
  );

  return (
    <CartContext.Provider value={{ cart, total, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
