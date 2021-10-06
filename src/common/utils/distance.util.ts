export const getDistance = (
  PreLat: number,
  PreLng: number,
  NextLat: number,
  NextLng: number,
) => {
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const R = 6371;
  const dLat = deg2rad(NextLat - PreLat);
  const dLon = deg2rad(NextLng - PreLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(PreLat)) *
      Math.cos(deg2rad(NextLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};
