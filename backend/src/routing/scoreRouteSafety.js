import ngeohash from "ngeohash";
import SafetyNode from "../models/safetyNode.js";

function average(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export async function scoreRouteSafety(coords) {
  let scores = [];

  for (const point of coords) {
    const hash = ngeohash.encode(point.lat, point.lng, 7);
    const hashes = [hash, ...ngeohash.neighbors(hash)];

    const nodes = await SafetyNode.find({
      geohash: { $in: hashes }
    }).lean();

    if (!nodes.length) {
      scores.push(0.3); // fallback if no data
    } else {
      scores.push(average(nodes.map(n => n.safetyScore)));
    }
  }

  return average(scores);
}
