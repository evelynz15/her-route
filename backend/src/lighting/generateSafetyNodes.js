function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.lat - b.lat, 2) +
    Math.pow(a.lng - b.lng, 2)
  );
}

export function generateSafetyNodes(grid, lamps) {
  return grid.map(point => {
    const lampCount = lamps.filter(l =>
      distance(point, { lat: l.lat, lng: l.lon }) < 0.0004
    ).length;

    const lightingScore = Math.min(lampCount / 5, 1);
    const safetyScore = lightingScore; // lighting-only MVP

    return {
      lat: point.lat,
      lng: point.lng,
      lampCount,
      lightingScore,
      safetyScore
    };
  });
}
