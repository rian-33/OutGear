import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    const message = error.errors?.map((e) => e.message).join(", ");
    return res.status(400).json({ success: false, message: message || "Validasi gagal" });
  }
};

export const orderSchema = z
  .object({
    customer: z.object({
      name: z.string().min(1, "Nama lengkap wajib diisi"),
      email: z.string().email("Email tidak valid"),
      phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
      address: z.string().min(5, "Alamat pengiriman wajib diisi"),
    }),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          name: z.string().min(1),
          mode: z.enum(["rent", "buy"]),
          quantity: z.number().int().min(1),
          price: z.number().min(0).optional(),
          basePrice: z.number().min(0).optional(),
          deposit: z.number().min(0).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          duration: z.number().int().min(1).optional(),
        }),
      )
      .min(1, "Keranjang tidak boleh kosong"),
    subtotal: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    deliveryFee: z.number().min(0).optional(),
    totalAmount: z.number().min(0).optional(),
    deliveryType: z.string().min(1).optional(),
    paymentMethod: z.string().min(1, "Metode pembayaran wajib diisi"),
    destination: z
      .object({
        lat: z.number(),
        lng: z.number(),
        label: z.string().optional(),
      })
      .optional(),
  });

export const productSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori wajib diisi"),
  buyPrice: z.number().min(0),
  rentPrice: z.number().min(0),
  stock: z.number().int().min(0).default(0),
  store: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const productUpdateSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1, "Nama produk wajib diisi").optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori wajib diisi").optional(),
  buyPrice: z.number().min(0).optional(),
  rentPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  store: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(
    [
      "Menunggu Pembayaran",
      "Diproses",
      "Dikirim",
      "Selesai",
      "Dibatalkan",
    ],
    "Status tidak valid",
  ),
});
