import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const { category, maxPrice, q, sort } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: "i" };
    if (maxPrice) {
      filter.$or = [
        { rentPrice: { $lte: Number(maxPrice) } },
        { buyPrice: { $lte: Number(maxPrice) } },
      ];
    }

    let query = Product.find(filter);

    if (sort === "price-low") query = query.sort({ rentPrice: 1 });

    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product)
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
