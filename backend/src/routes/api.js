import express from "express";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { scoreRouteSafety } from "../routing/scoreRouteSafety.js";
import { isInServiceArea, SERVICE_AREA } from "../config/areas.js";

const router = express.Router();
const SAFETY_WEIGHT = 0.7;
const TIME_WEIGHT = 0.3;

const photon = axios.create({
  baseURL: process.env.PHOTON_URL || "https://photon.komoot.io",
  timeout: 10000,
  headers: { "User-Agent": process.env.PHOTON_USER_AGENT || "herroute/1.0" },
});

const osrm = axios.create({
  baseURL: process.env.OSRM_URL || "https://routing.openstreetmap.de/routed-foot",
  timeout: 15000,
});

// Rank results near University of Waterloo / Wilfrid Laurier first, and only return
// places inside SERVICE_AREA.
const PHOTON_PARAMS = {
  lat: 43.473,
  lon: -80.536,
  bbox: [SERVICE_AREA.west, SERVICE_AREA.south, SERVICE_AREA.east, SERVICE_AREA.north].join(","),
  lang: "en",
};

// Only route within SERVICE_AREA (UW / Laurier area): bounds the work per request,
// keeps traffic to the free OSRM server reasonable, and matches the seeded safety data.
// Returns {latitude, longitude} as finite numbers inside SERVICE_AREA, or null.
function toServiceAreaPoint(p) {
  const latitude = Number(p?.latitude);
  const longitude = Number(p?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!isInServiceArea(latitude, longitude)) return null;
  return { latitude, longitude };
}

const MAX_ADDRESS_LENGTH = 200;

// True for a non-empty string short enough to send to the geocoder.
function isValidAddress(a) {
  return typeof a === "string" && a.trim().length > 0 && a.length <= MAX_ADDRESS_LENGTH;
}

// Log upstream failures without the request config
function logError(context, e) {
  console.error(`[${context}]`, e?.message || String(e), {
    code: e?.code,
    status: e?.response?.status,
  });
}

// Photon has no ready-made display label, so build one like
// "Dana Porter Library, Arts Quad, Waterloo" from the parts it returns.
function photonLabel(p = {}) {
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const parts = [p.name, street, p.city || p.locality || p.district];
  return [...new Set(parts.filter(Boolean))].join(", ");
}

async function photonSearch(text, limit) {
  const { data } = await photon.get("/api", {
    params: { q: text, limit, ...PHOTON_PARAMS },
  });
  return data.features || [];
}

async function getCoordinates(address) {
  const [feature] = await photonSearch(address, 1);
  if (!feature) throw new Error(`No geocoding result for "${address}"`);
  const [lng, lat] = feature.geometry.coordinates; // GeoJSON order is [lon, lat]
  return { latitude: lat, longitude: lng };
}

router.get("/suggestions", async (req, res) => {
  try {
    const { address } = req.query;
    if (address === undefined || address === "") return res.json([]);
    if (!isValidAddress(address)) {
      return res.status(400).json({
        ok: false,
        error: `address must be a single string of at most ${MAX_ADDRESS_LENGTH} characters`,
      });
    }
    const features = await photonSearch(address, 5);
    res.json(
      features.map((f) => ({
        description: photonLabel(f.properties),
        place_id: `${f.properties.osm_type}${f.properties.osm_id}`,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
      }))
    );
  } catch (e) {
    logError("suggestions", e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

router.post("/routes", async (req, res) => {
  try {
    let { origin, destination } = req.body || {};

    for (const value of [origin, destination]) {
      if (typeof value === "string" && !isValidAddress(value)) {
        return res.status(400).json({
          ok: false,
          error: `Address strings must be non-empty and at most ${MAX_ADDRESS_LENGTH} characters`,
        });
      }
    }

    if (typeof origin === "string") {
      origin = await getCoordinates(origin);
    }
    if (typeof destination === "string") {
      destination = await getCoordinates(destination);
    }

    origin = toServiceAreaPoint(origin);
    destination = toServiceAreaPoint(destination);
    if (!origin || !destination) {
      return res.status(400).json({
        ok: false,
        error:
          "Send origin and destination as {latitude, longitude} or an address string, " +
          "both within the University of Waterloo / Wilfrid Laurier service area",
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
    logError("routes", e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

export default router;
