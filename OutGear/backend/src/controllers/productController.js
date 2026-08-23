import { products } from "../data/products.js";

// MVC Controller: Mengambil dan memfilter semua produk
export const getProducts = (req, res) => {
  const { category, maxPrice, q } = req.query;

  let result = products.filter((p) => {
    const categoryMatch =
      !category || p.category.toLowerCase() === category.toLowerCase();
    const queryMatch = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const priceMatch =
      !maxPrice ||
      p.rentPrice <= Number(maxPrice) ||
      p.buyPrice <= Number(maxPrice);
    return categoryMatch && queryMatch && priceMatch;
  });

  res.json(result); // View/Response Layer
};

// MVC Controller: Mengambil detail satu produk
export const getProductById = (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product)
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  res.json(product);
};
