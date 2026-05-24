import ngeohash from "ngeohash";
import SafetyNode from "../models/safetyNode.js";

function average(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export async function scoreRouteSafety(coords) {
  let safetyScores = [];
  let lightingScores = [];
  let activityScores = [];

  for (const point of coords) {
    const hash = ngeohash.encode(point.lat, point.lng, 7);
    const hashes = [hash, ...ngeohash.neighbors(hash)];

    const nodes = await SafetyNode.find({
      geohash: { $in: hashes }
    }).lean();

    if (!nodes.length) {
      safetyScores.push(0.3);
      lightingScores.push(0.3);
      activityScores.push(0.3);
    } else {
      safetyScores.push(average(nodes.map(n => n.safetyScore)));
      lightingScores.push(average(nodes.map(n => n.lightingScore)));
      activityScores.push(average(nodes.map(n => n.activityScore)));
    }
  }

  return {
    safetyScore: average(safetyScores),
    lightingScore: average(lightingScores),
    activityScore: average(activityScores),
  };
}
