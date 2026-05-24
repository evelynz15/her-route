import ngeohash from "ngeohash";

function distanceMeters(a, b) {
  const METERS_PER_DEGREE = 111_000; // approx

  return Math.sqrt(
    Math.pow((a.lat - b.lat) * METERS_PER_DEGREE, 2) +
    Math.pow((a.lng - b.lng) * METERS_PER_DEGREE, 2)
  );
}

function countNearby(point, features, radius = 90) {
  return features.filter(feature =>
    distanceMeters(point, {
      lat: feature.lat,
      lng: feature.lon || feature.lng
    }) < radius
  ).length;
}

/*
export function generateSafetyNodes(grid, lamps) {
    console.log("Grid sample:", grid.slice(0, 5));
  return grid.map(point => {
    const lampCount = lamps.filter(l =>
      distanceMeters(point, { lat: l.lat, lng: l.lon }) < 90
    ).length;

    const lightingScore = Math.min(lampCount / 5, 1);
    const safetyScore = lampCount === 0 ? 0.1 : lightingScore; // lighting-only MVP

    return {
      lat: point.lat,
      lng: point.lng,
      geohash: ngeohash.encode(point.lat, point.lng, 7), // ~150m precision
      lampCount,
      lightingScore,
      userVoteSum: 0,
      userVoteCount: 0,
      safetyScore
    };
  });
} */

// normalize count into [0,1]
function normalize(count, max) {
  return Math.min(count / max, 1);
}

// generate safety nodes
export function generateSafetyNodes(grid, data) {

  const {
    lamps,
    restaurants,
    cafes,
    transitStops,
    convenienceStores
  } = data;

  // First pass: compute raw counts for every point
  const raw = grid.map(point => {
    const lampCount = countNearby(point, lamps);
    const restaurantCount = countNearby(point, restaurants);
    const cafeCount = countNearby(point, cafes);
    const transitStopCount = countNearby(point, transitStops);
    const convenienceStoreCount = countNearby(point, convenienceStores);
    const rawActivity =
      restaurantCount * 3 +
      cafeCount * 2 +
      transitStopCount * 4 +
      convenienceStoreCount * 5;

    return { point, lampCount, restaurantCount, cafeCount, transitStopCount, convenienceStoreCount, rawActivity };
  });

  // Fixed max for lamps — nodes with 3+ lamps score 1.0
  const maxLamps = 3;
  // Dynamic max for activity so the busiest node in the dataset scores 1.0
  const maxActivity = Math.max(...raw.map(r => r.rawActivity), 1);

  // Second pass: normalize and score
  return raw.map(({ point, lampCount, restaurantCount, cafeCount, transitStopCount, convenienceStoreCount, rawActivity }) => {
    const lightingScore = normalize(lampCount, maxLamps);
    const activityScore = normalize(rawActivity, maxActivity);

    const safetyScore =
      lightingScore * 0.6 +
      activityScore * 0.4;

    return {
      lat: point.lat,
      lng: point.lng,

      geohash: ngeohash.encode(point.lat, point.lng, 7),

      // Lighting
      lampCount,
      lightingScore,

      // Activity
      restaurantCount,
      cafeCount,
      transitStopCount,
      convenienceStoreCount,
      activityScore,

      // Community feedback
      userVoteSum: 0,
      userVoteCount: 0,

      // Final score
      safetyScore
    };
  });
}
