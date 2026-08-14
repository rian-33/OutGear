// Haversine: menghitung jarak dua koordinat bumi dalam kilometer.
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

export function calculateDeliveryFee(distanceKm) {
  const base = 10000;
  const perKm = 3000;
  return Math.round(base + Math.max(0, distanceKm) * perKm);
}
