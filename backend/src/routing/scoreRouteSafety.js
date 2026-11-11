import ngeohash from "ngeohash";
import SafetyNode from "../models/safetyNode.js";

const GEOHASH_PRECISION = 7; // ~150m x 150m cells
const SAMPLE_SPACING_M = 50; // score one point every 50m along the route
const MAX_SAMPLES = 500; // hard cap per route; spacing grows for longer routes
const DEFAULT_SCORE = 0.3; // used where no safety data is nearby

function average(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Approximate distance in metres (equirectangular; accurate at city scale)
function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const x = (b.lng - a.lng) * toRad * Math.cos(((a.lat + b.lat) / 2) * toRad);
  const y = (b.lat - a.lat) * toRad;
  return Math.sqrt(x * x + y * y) * R;
}

// Resample a route to evenly spaced points so every stretch of road counts equally,
// no matter how many vertices the router returned, and the work per route is bounded.
export function samplePoints(coords) {
  if (coords.length <= 1) return coords.slice();

  let total = 0;
  for (let i = 1; i < coords.length; i++) total += distanceMeters(coords[i - 1], coords[i]);
  const spacing = Math.max(SAMPLE_SPACING_M, total / (MAX_SAMPLES - 1));

  const samples = [coords[0]];
  let nextAt = spacing;
  let travelled = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const seg = distanceMeters(a, b);
    while (seg > 0 && travelled + seg >= nextAt && samples.length < MAX_SAMPLES - 1) {
      const t = (nextAt - travelled) / seg;
      samples.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
      nextAt += spacing;
    }
    travelled += seg;
  }
  samples.push(coords[coords.length - 1]);
  return samples;
}

export async function scoreRouteSafety(coords) {
  const points = samplePoints(coords).map((p) => {
    const hash = ngeohash.encode(p.lat, p.lng, GEOHASH_PRECISION);
    return [hash, ...ngeohash.neighbors(hash)];
  });

  // One database query per route instead of one per point
  const uniqueHashes = [...new Set(points.flat())];
  const nodes = await SafetyNode.find(
    { geohash: { $in: uniqueHashes } },
    { geohash: 1, safetyScore: 1, lightingScore: 1, activityScore: 1 }
  ).lean();

  const byHash = new Map();
  for (const n of nodes) {
    if (!byHash.has(n.geohash)) byHash.set(n.geohash, []);
    byHash.get(n.geohash).push(n);
  }

  const safetyScores = [];
  const lightingScores = [];
  const activityScores = [];

  for (const hashes of points) {
    const nearby = hashes.flatMap((h) => byHash.get(h) || []);
    if (!nearby.length) {
      safetyScores.push(DEFAULT_SCORE);
      lightingScores.push(DEFAULT_SCORE);
      activityScores.push(DEFAULT_SCORE);
    } else {
      safetyScores.push(average(nearby.map((n) => n.safetyScore)));
      lightingScores.push(average(nearby.map((n) => n.lightingScore)));
      activityScores.push(average(nearby.map((n) => n.activityScore)));
    }
  }

  return {
    safetyScore: average(safetyScores),
    lightingScore: average(lightingScores),
    activityScore: average(activityScores),
  };
}
