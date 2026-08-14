import { Router } from "express";
import {
  calculateDistanceKm,
  calculateDeliveryFee,
} from "../utils/distance.js";
import { calculateLateFee } from "../utils/lateFee.js";

const router = Router();

router.post("/delivery-fee", (req, res) => {
  const { userLocation, storeLocation, deliveryType } = req.body;

  if (deliveryType === "pickup") {
    return res.json({ distanceKm: 0, deliveryFee: 0 });
  }

  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    storeLocation.lat,
    storeLocation.lng,
  );

  res.json({
    distanceKm: Number(distanceKm.toFixed(2)),
    deliveryFee: calculateDeliveryFee(distanceKm),
  });
});

router.post("/late-fee", (req, res) => {
  try {
    res.json(calculateLateFee(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/", (req, res) => {
  // Prototype: tahap ini belum menyimpan order ke database.
  const order = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    status: "Menunggu Pembayaran",
  };
  res.status(201).json(order);
});

export default router;
