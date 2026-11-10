import express from "express";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { scoreRouteSafety } from "../routing/scoreRouteSafety.js";

const router = express.Router();
const SAFETY_WEIGHT = 0.7;
const TIME_WEIGHT = 0.3;

const pelias = axios.create({
  baseURL: process.env.PELIAS_URL,
  params: process.env.PELIAS_KEY ? { api_key: process.env.PELIAS_KEY } : {},
});

// Free FOSSGIS OSRM server (walking profile). Fair-use / non-commercial; self-host for production.
const osrm = axios.create({
  baseURL: process.env.OSRM_URL || "https://routing.openstreetmap.de/routed-foot",
  timeout: 15000,
});

// Bias results toward University of Waterloo / Wilfrid Laurier so local matches rank first
const FOCUS = {
  "focus.point.lat": 43.473,
  "focus.point.lon": -80.536,
  "boundary.country": "CA",
};

async function getCoordinates(address) {
  const { data } = await pelias.get("/search", {
    params: { text: address, size: 1, ...FOCUS },
  });
  const feature = data.features?.[0];
  if (!feature) throw new Error(`No geocoding result for "${address}"`);
  const [lng, lat] = feature.geometry.coordinates; // GeoJSON order is [lon, lat]
  return { latitude: lat, longitude: lng };
}

router.get("/suggestions", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.json([]);
    const { data } = await pelias.get("/autocomplete", {
      params: { text: address, ...FOCUS },
    });
    res.json(
      (data.features || []).map((f) => ({
        description: f.properties.label,
        place_id: f.properties.gid,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

router.post("/routes", async (req, res) => {
  try {
    let { origin, destination } = req.body || {};

    if (typeof origin === "string") {
      origin = await getCoordinates(origin);
    }
    if (typeof destination === "string") {
      destination = await getCoordinates(destination);
    }

    if (
      !origin?.latitude ||
      !origin?.longitude ||
      !destination?.latitude ||
      !destination?.longitude
    ) {
      return res.status(400).json({
        ok: false,
        error: "Send origin and destination as {latitude, longitude} or an address string",
      });
    }

    // OSRM expects lon,lat order
    const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const r = await osrm.get(`/route/v1/foot/${coords}`, {
      params: { alternatives: 3, overview: "full", geometries: "polyline" },
      validateStatus: (s) => s < 500, // OSRM returns 400 for e.g. "NoRoute"; handled below
    });

    if (r.data.code !== "Ok" || !r.data.routes?.length) {
      return res.status(502).json({
        ok: false,
        status: r.data.code,
        error_message: r.data.message || null,
      });
    }

    const routes = r.data.routes.map((route, i) => ({
      route_id: `route_${i}`,
      distance_m: route.distance,
      duration_s: route.duration,
      polyline: route.geometry,
      coords: polyline.decode(route.geometry).map(([lat, lng]) => ({ lat, lng })),
    }));

    for (const route of routes) {
      const scores = await scoreRouteSafety(route.coords);
      route.safetyScore = scores.safetyScore;
      route.lightingScore = scores.lightingScore;
      route.activityScore = scores.activityScore;
    }

    const maxDuration = Math.max(...routes.map(r => r.duration_s));
    const minDuration = Math.min(...routes.map(r => r.duration_s));

    function normalizeDuration(d) {
      if (maxDuration === minDuration) return 1;
      return 1 - (d - minDuration) / (maxDuration - minDuration);
    }

    for (const route of routes) {
      route.combinedScore =
        SAFETY_WEIGHT * route.safetyScore +
        TIME_WEIGHT * normalizeDuration(route.duration_s);
    }

    routes.sort((a, b) => b.combinedScore - a.combinedScore);
    const bestRoute = routes[0];

    res.json({
      ok: true,
      bestRoute,
      meta: {
        candidateCount: routes.length,
        selection: "safety_first_then_speed",
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

export default router;
