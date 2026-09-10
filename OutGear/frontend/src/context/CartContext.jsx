import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "outgear_cart";
const RENT_DEPOSIT = 50000;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, mode, quantity = 1, rentalData = null) {
    const maxStock = Number.isFinite(product.stock) ? product.stock : Infinity;
    const finalQuantity =
      maxStock >= quantity ? quantity : Math.max(1, maxStock);

    if (finalQuantity <= 0) return;

    const duration = rentalData?.duration || 1;
    const startDate = rentalData?.startDate || null;
    const endDate = rentalData?.endDate || null;

    const basePrice =
      mode === "rent" ? product.rentPrice * duration : product.buyPrice;

    const deposit = mode === "rent" ? RENT_DEPOSIT : 0;

    const item = {
      productId: product.id || product._id,
      name: product.name,
      mode,
      quantity: finalQuantity,
      basePrice,
      price: basePrice,
      deposit,
      startDate,
      endDate,
      duration,
      cartId: `${product.id || product._id}-${mode}-${Date.now()}`,
    };

    setCart((current) => [...current, item]);
  }

  function removeFromCart(cartId) {
    setCart((current) =>
      current.filter((item) => item.cartId !== cartId),
    );
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.basePrice + item.deposit) * item.quantity,
    0,
  );

  const totalDeposit = cart.reduce(
    (sum, item) => sum + item.deposit * item.quantity,
    0,
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        totalDeposit,
        itemCount,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
