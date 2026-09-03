import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const { category, maxPrice, q, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = category.toLowerCase();
    if (q) filter.name = { $regex: q, $options: "i" };
    if (maxPrice) {
      filter.$or = [
        { rentPrice: { $lte: Number(maxPrice) } },
        { buyPrice: { $lte: Number(maxPrice) } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price-low") sortObj = { rentPrice: 1 };
    if (sort === "price-high") sortObj = { rentPrice: -1 };
    if (sort === "rating") sortObj = { rating: -1 };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil produk",
        error: error.message,
      });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID wajib diisi" });

    const product = await Product.findOne({ $or: [{ _id: id }, { id: id }] });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });

    res.json({ success: true, data: product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, rentPrice, buyPrice, stock } =
      req.body;
    if (!name || !category || (!rentPrice && !buyPrice)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Field required: name, category, minimal satu harga",
        });
    }

    const newProduct = new Product({
      name,
      description,
      category: category.toLowerCase(),
      rentPrice: rentPrice || 0,
      buyPrice: buyPrice || 0,
      stock: stock || 0,
    });

    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({ success: true, message: "Produk dibuat", data: savedProduct });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal membuat produk",
        error: error.message,
      });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!updatedProduct)
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    res.json({
      success: true,
      message: "Produk diupdate",
      data: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal update", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    res.json({ success: true, message: "Produk dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal hapus", error: error.message });
  }
};
