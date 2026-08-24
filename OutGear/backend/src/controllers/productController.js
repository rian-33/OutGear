import { products } from "../data/products.js";
import Product from "../models/Product.js";

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

// Fungsi untuk menyimpan produk baru ke MongoDB
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Produk berhasil ditambahkan ke database!",
      data: savedProduct,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gagal menambah produk", error: error.message });
  }
};
