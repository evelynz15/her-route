import ngeohash from "ngeohash";

// Approximate distance in metres (equirectangular; accurate at city scale).
// Longitude degrees shrink with latitude, so scale them by cos(lat).
function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const x = (b.lng - a.lng) * toRad * Math.cos(((a.lat + b.lat) / 2) * toRad);
  const y = (b.lat - a.lat) * toRad;
  return Math.sqrt(x * x + y * y) * R;
}

// Overpass returns nodes with top-level lat/lon, but ways (e.g. a restaurant mapped
// as a building outline) only have a `center` when queried with `out center`.
// Returns {lat, lng}, or null if the element has no usable position.
function toPoint(feature) {
  const src = feature.lat !== undefined ? feature : feature.center;
  if (!src) return null;
  const lat = src.lat;
  const lng = src.lon ?? src.lng;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function toPoints(features) {
  return features.map(toPoint).filter(Boolean);
}

function countNearby(point, points, radius = 90) {
  return points.filter(p => distanceMeters(point, p) < radius).length;
}

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
  } = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toPoints(v)]));

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
  const maxActivity = raw.reduce((max, r) => Math.max(max, r.rawActivity), 1);

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
