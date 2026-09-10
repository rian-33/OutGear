import bootsImg from "../assets/boots.png";
import tentImg from "../assets/tent.png";
import backpackImg from "../assets/backpack.png";
import gearImg from "../assets/gear2.png";
import komporImg from "../assets/portable.png";
import jaketImg from "../assets/jaket.png";
import headlampImg from "../assets/headlamp.png";

export function getProductImage(category) {
  switch (category?.toLowerCase()) {
    case "tas":
    case "carrier":
      return backpackImg;
    case "sepatu":
      return bootsImg;
    case "tenda":
      return tentImg;
    case "kompor":
      return komporImg;
    case "jaket":
      return jaketImg;
    case "lampu":
      return headlampImg;
    case "peralatan":
      return gearImg;
    default:
      return gearImg;
  }
}

export function formatRupiah(value) {
  return value?.toLocaleString("id-ID") ?? "0";
}
