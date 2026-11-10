// Manual check of route safety scoring against the MongoDB safety data.
// Run from backend/:  node src/testRouteSafety.js
// A score of exactly 0.3 means no safety nodes were found near any point (the default).
import "dotenv/config";
import mongoose from "mongoose";
import { scoreRouteSafety } from "./routing/scoreRouteSafety.js";

// Sample walking routes from University of Waterloo to Wilfrid Laurier
const routes = [
  {
    route_id: "university_ave",
    duration_s: 1400,
    coords: [
      { lat: 43.4723, lng: -80.5449 },
      { lat: 43.4729, lng: -80.54 },
      { lat: 43.4733, lng: -80.535 },
      { lat: 43.4738, lng: -80.5275 },
    ],
  },
  {
    route_id: "via_columbia",
    duration_s: 1700,
    coords: [
      { lat: 43.4723, lng: -80.5449 },
      { lat: 43.478, lng: -80.542 },
      { lat: 43.4775, lng: -80.53 },
      { lat: 43.4738, lng: -80.5275 },
    ],
  },
];

await mongoose.connect(process.env.MONGO_URI);
try {
  for (const route of routes) {
    Object.assign(route, await scoreRouteSafety(route.coords));
  }
  console.table(
    routes.map((r) => ({
      route: r.route_id,
      duration_s: r.duration_s,
      safety: r.safetyScore,
      lighting: r.lightingScore,
      activity: r.activityScore,
    }))
  );
} finally {
  await mongoose.disconnect();
}
