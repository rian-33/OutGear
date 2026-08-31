import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("outgear_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("outgear_cart", JSON.stringify(cart));
  }, [cart]);

  // Tambahan parameter: duration, startDate, endDate
  function addToCart(product, mode, quantity = 1, rentalData = null) {
    setCart((current) => {
      // Jika mode sewa, tambahkan logika durasi dan deposit
      const duration = rentalData?.duration || 1;
      const startDate = rentalData?.startDate || null;
      const endDate = rentalData?.endDate || null;

      // Hitung subtotal harga (Sewa x Durasi, atau Beli x 1)
      const basePrice =
        mode === "rent" ? product.rentPrice * duration : product.buyPrice;

      // Logika Deposit: Hanya untuk mode sewa (misal flat Rp 50.000 per barang)
      const deposit = mode === "rent" ? 50000 : 0;

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          mode,
          quantity,
          basePrice,
          deposit,
          startDate,
          endDate,
          duration,
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

  // Kalkulasi Total Keseluruhan (Harga + Deposit) x Kuantitas
  const total = cart.reduce(
    (sum, item) => sum + (item.basePrice + item.deposit) * item.quantity,
    0,
  );
  const totalDeposit = cart.reduce(
    (sum, item) => sum + item.deposit * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        totalDeposit,
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
  return useContext(CartContext);
}
