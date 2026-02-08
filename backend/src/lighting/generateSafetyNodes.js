import ngeohash from "ngeohash";

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.lat - b.lat, 2) +
    Math.pow(a.lng - b.lng, 2)
  );
}

export function generateSafetyNodes(grid, lamps) {
  return grid.map(point => {
    const lampCount = lamps.filter(l =>
      distance(point, { lat: l.lat, lng: l.lon }) < 90
    ).length;

    const lightingScore = Math.min(lampCount / 5, 1);
    const safetyScore = lampCount === 0 ? 0.1 : lightingScore; // lighting-only MVP

    return {
      lat: point.lat,
      lng: point.lng,
      geohash: ngeohash.encode(point.lat, point.lng, 7), // ~150m precision
      lampCount,
      lightingScore,
      safetyScore
    };
  });
}
