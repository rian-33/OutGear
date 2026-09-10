import bootsImg from "../assets/boots.png";
import tentImg from "../assets/tent.png";
import backpackImg from "../assets/backpack.png";
import komporImg from "../assets/portable.png";
import jaketImg from "../assets/jaket.png";
import headlampImg from "../assets/headlamp.png";

export const fallbackProducts = [
  {
    id: "tenda-2p",
    name: "Tenda 2 Person Premium",
    category: "tenda",
    description:
      "Tenda double layer tahan badai untuk kapasitas 2 orang, sangat ringan dan mudah dipasang.",
    buyPrice: 850000,
    rentPrice: 60000,
    stock: 8,
  },
  {
    id: "carrier-60l",
    name: "Carrier Gunung 60L Explorer",
    category: "tas",
    description:
      "Tas carrier ergonomis dengan ventilasi punggung optimal untuk pendakian 3-4 hari.",
    buyPrice: 1250000,
    rentPrice: 75000,
    stock: 5,
  },
  {
    id: "sepatu-hiking",
    name: "Sepatu Hiking Waterproof",
    category: "sepatu",
    description:
      "Sepatu gunung anti air dengan traksi cengkeraman tinggi di segala medan.",
    buyPrice: 950000,
    rentPrice: 70000,
    stock: 6,
  },
  {
    id: "kompor-outdoor",
    name: "Kompor Portable Windproof",
    category: "peralatan",
    description:
      "Kompor mini lipat tahan angin untuk memasak cepat di alam bebas.",
    buyPrice: 450000,
    rentPrice: 35000,
    stock: 10,
  },
  {
    id: "jaket-shell",
    name: "Jaket Mountain Shell Windbreaker",
    category: "jaket",
    description: "Jaket windbreaker tahan air dan angin intensitas tinggi.",
    buyPrice: 750000,
    rentPrice: 50000,
    stock: 7,
  },
  {
    id: "headlamp-led",
    name: "Headlamp LED Ultra Bright",
    category: "lampu",
    description:
      "Lampu kepala LED dengan daya tahan baterai lama dan mode SOS.",
    buyPrice: 250000,
    rentPrice: 20000,
    stock: 15,
  },
];

export const categoryList = [
  { value: "", label: "Semua Kategori", icon: null },
  { value: "tenda", label: "Tenda & Shelter", icon: tentImg },
  { value: "tas", label: "Carrier & Tas", icon: backpackImg },
  { value: "sepatu", label: "Sepatu & Boots", icon: bootsImg },
  { value: "peralatan", label: "Kompor & Masak", icon: komporImg },
  { value: "jaket", label: "Jaket & Pakaian", icon: jaketImg },
  { value: "lampu", label: "Senter & Headlamp", icon: headlampImg },
];

export function getCategoryLabel(value) {
  if (!value) return "Outdoor Gear";
  const found = categoryList.find((c) => c.value === value);
  return found ? found.label : value;
}

export function filterProducts(products, { category = "", q = "", maxPrice = "" } = {}) {
  return products.filter((p) => {
    if (category && p.category !== category) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (maxPrice && p.rentPrice > Number(maxPrice) && p.buyPrice > Number(maxPrice))
      return false;
    return true;
  });
}