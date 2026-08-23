import { useState } from "react";
import { calculateDeliveryFee, createOrder } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { cart, total, removeFromCart } = useCart();
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [payment, setPayment] = useState("QRIS");
  const [message, setMessage] = useState("");

  async function detectLocation() {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const store = cart[0]?.store || { lat: -5.1477, lng: 119.4327 };
        const result = await calculateDeliveryFee({
          userLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          storeLocation: store,
          deliveryType,
        });
        setDistanceKm(result.distanceKm);
        setDeliveryFee(result.deliveryFee);
      },
      () => setMessage("Lokasi tidak dapat diakses."),
    );
  }

  async function submitOrder() {
    const order = await createOrder({
      items: cart.map(({ id, mode, name }) => ({ id, mode, name })),
      deliveryType,
      distanceKm,
      deliveryFee,
      payment,
      total: total + deliveryFee,
    });
    setMessage(`Pesanan ${order.id} berhasil dibuat. Status: ${order.status}`);
  }

  return (
    <main className="section checkout">
      <h1>Pesan Sekarang</h1>

      {cart.length === 0 ? (
        <p>Keranjang masih kosong. Tambahkan produk dari katalog.</p>
      ) : (
        <>
          <div className="cart">
            {cart.map((item) => (
              <div className="cart-item" key={item.cartId}>
                <div>
                  <b>{item.name}</b>
                  <br />
                  Mode: {item.mode === "rent" ? "Sewa" : "Beli"}
                </div>
                <button onClick={() => removeFromCart(item.cartId)}>
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <section className="checkout-box">
            <h2>Pengiriman</h2>
            <label>
              <input
                type="radio"
                checked={deliveryType === "delivery"}
                onChange={() => setDeliveryType("delivery")}
              />
              Diantar
            </label>
            <label>
              <input
                type="radio"
                checked={deliveryType === "pickup"}
                onChange={() => setDeliveryType("pickup")}
              />
              Ambil Sendiri
            </label>
            {deliveryType === "delivery" && (
              <button onClick={detectLocation}>
                Deteksi Lokasi & Hitung Jarak
              </button>
            )}
            <p>
              Jarak: {distanceKm} km • Ongkir: Rp{" "}
              {deliveryFee.toLocaleString("id-ID")}
            </p>
          </section>

          <section className="checkout-box">
            <h2>Pembayaran</h2>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option>QRIS</option>
              <option>Transfer Bank / Virtual Account</option>
              <option>Tunai / Bayar di Tempat</option>
            </select>
          </section>

          <div className="summary">
            <h2>Total: Rp {(total + deliveryFee).toLocaleString("id-ID")}</h2>
            <button className="button" onClick={submitOrder}>
              Buat Pesanan
            </button>
          </div>
          {message && <p className="success">{message}</p>}
        </>
      )}
    </main>
  );
}
