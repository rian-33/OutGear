const fs = require("fs");
const path = require("path");

// 1. Daftar Folder yang akan dibuat
const folders = [
  "backend/src/controllers",
  "backend/src/models",
  "backend/src/routes",
  "backend/src/utils",
  "backend/src/data",
  "frontend/src/assets",
  "frontend/src/components",
  "frontend/src/context",
  "frontend/src/pages",
  "frontend/src/services",
];

// 2. Daftar File beserta isi dasarnya (agar tidak benar-benar kosong)
const files = {
  // Backend Files
  "backend/.env":
    "PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/outdoor_rental",
  "backend/src/server.js":
    '// File utama Backend Express.js\nconsole.log("Backend siap dibangun!");',
  "backend/src/data/products.js":
    "// Data sementara produk\nexport const products = [];",

  // Frontend Files
  "frontend/index.html":
    '<!DOCTYPE html>\n<html lang="id">\n<body>\n  <div id="root"></div>\n</body>\n</html>',
  "frontend/src/main.jsx": "// File utama React",
  "frontend/src/App.jsx": "// Pengatur Routing Halaman React",
  "frontend/src/styles.css":
    "/* Global CSS */\nbody { font-family: sans-serif; }",
  "frontend/src/context/CartContext.jsx":
    "// Tempat menyimpan state keranjang belanja",
  "frontend/src/services/api.js": "// Fungsi untuk memanggil API ke Backend",

  // Halaman Frontend
  "frontend/src/pages/Home.jsx":
    "export default function Home() { return <h1>Home Page</h1>; }",
  "frontend/src/pages/Products.jsx":
    "export default function Products() { return <h1>Products Page</h1>; }",
  "frontend/src/pages/Checkout.jsx":
    "export default function Checkout() { return <h1>Checkout Page</h1>; }",

  // Komponen Frontend
  "frontend/src/components/Navbar.jsx":
    "export default function Navbar() { return <nav>Navbar</nav>; }",
  "frontend/src/components/ProductCard.jsx":
    "export default function ProductCard() { return <div>Card</div>; }",
};

console.log("Memulai pembuatan struktur proyek...");

// Eksekusi pembuatan folder
folders.forEach((folder) => {
  const targetDir = path.join(__dirname, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✅ Folder dibuat: ${folder}`);
  }
});

// Eksekusi pembuatan file
Object.keys(files).forEach((file) => {
  const targetFile = path.join(__dirname, file);
  if (!fs.existsSync(targetFile)) {
    fs.writeFileSync(targetFile, files[file], "utf8");
    console.log(`📄 File dibuat: ${file}`);
  }
});

console.log("🎉 Struktur proyek berhasil dibuat!");
