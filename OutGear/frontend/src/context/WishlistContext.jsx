import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "outgear_wishlist";

function normalizeId(product) {
  return product.id || product._id;
}

function createSnapshot(product) {
  return {
    id: normalizeId(product),
    name: product.name,
    category: product.category,
    description: product.description,
    rentPrice: product.rentPrice,
    buyPrice: product.buyPrice,
    stock: product.stock,
  };
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isWishlisted = (product) =>
    wishlist.some((item) => item.id === normalizeId(product));

  const toggleWishlist = (product) => {
    const id = normalizeId(product);
    setWishlist((current) =>
      current.some((item) => item.id === id)
        ? current.filter((item) => item.id !== id)
        : [...current, createSnapshot(product)],
    );
  };

  const removeFromWishlist = (id) => {
    setWishlist((current) => current.filter((item) => item.id !== id));
  };

  const count = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{ wishlist, count, isWishlisted, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}