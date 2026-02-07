import { pool } from "../db.js";
import { fetchStreetLights } from "./fetchLighting.js";
import { generateSafetyNodes } from "./generateSafetyNodes.js";

function generateGrid() {
  const points = [];
  for (let lat = 43.648; lat <= 43.660; lat += 0.0005) {
    for (let lng = -79.395; lng <= -79.375; lng += 0.0005) {
      points.push({ lat, lng });
    }
  }
  return points;
}

export async function seedDatabase() {
  const lamps = await fetchStreetLights();
  const grid = generateGrid();
  const nodes = generateSafetyNodes(grid, lamps);

  for (const n of nodes) {
    await pool.query(
      `INSERT INTO safety_nodes
       (lat, lng, lamp_count, lighting_score, safety_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [n.lat, n.lng, n.lampCount, n.lightingScore, n.safetyScore]
    );
  }

  console.log("Database seeded:", nodes.length);
}
