import express from "express";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { scoreRouteSafety } from "../routing/scoreRouteSafety.js";

const router = express.Router();
const SAFETY_WEIGHT = 0.7;
const TIME_WEIGHT = 0.3;

async function getCoordinates(address) {
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_KEY,
      },
    }
  );
  const location = response.data.results[0].geometry.location;
  return { latitude: location.lat, longitude: location.lng };
}

router.get("/suggestions", async (req, res) => {
  try {
    const { address } = req.query;
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        params: {
          input: address,
          key: process.env.GOOGLE_MAPS_KEY,
        },
      }
    );
    res.json(response.data.predictions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

router.post("/routes", async (req, res) => {
  try {
    const mapsKey = process.env.GOOGLE_MAPS_KEY;
    if (!mapsKey)
      return res.status(500).json({ ok: false, error: "Missing GOOGLE_MAPS_KEY" });

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

    const r = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode: "walking",
          alternatives: true,
          key: mapsKey,
        },
      }
    );

    if (r.data.status !== "OK") {
      return res.status(502).json({
        ok: false,
        status: r.data.status,
        error_message: r.data.error_message || null,
      });
    }

    const routes = r.data.routes.map((route, i) => {
      const leg = route.legs?.[0];
      const decoded = polyline.decode(route.overview_polyline.points);
      return {
        route_id: `route_${i}`,
        distance_m: leg?.distance?.value,
        duration_s: leg?.duration?.value,
        polyline: route.overview_polyline.points,
        coords: decoded.map(([lat, lng]) => ({ lat, lng })),
      };
    });

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
