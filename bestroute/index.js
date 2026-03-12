const SAFETY_WEIGHT = 0.7;
const TIME_WEIGHT = 0.3;

// Load environment variables (Directions API Key)
require("dotenv").config();
const BACKEND_URL = process.env.BACKEND_URL;

// Set up entering, rules and log book
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");

// Set up HTTP requests to other services
const axios = require("axios");

// Decodes compressed strings into actual lat/long points
const polyline = require("@mapbox/polyline");

// Define Geohatches

// Max amount of same request count for managing traffic
setGlobalOptions({ maxInstances: 10 });

// Storing the Directions in mapsKey
const mapsKey = process.env.GOOGLE_MAPS_KEY;

exports.getCoordinates = async (address) => {

  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        address: address,
        key: mapsKey
      }
    }
  );

  const location = response.data.results[0].geometry.location;
  console.log(location);

  return {
    latitude: location.lat,
    longitude: location.lng
  };
}

// Names the site and allows interactivity
// Indepdantly (doesn't disrupt) request and response
exports.getRoutes = onRequest(async (req, res) => {
  // Normal Flow
  try {
    // If Directions API is missing, stop and tell
    if (!mapsKey)
      return res
        .status(500)
        .json({ ok: false, error: "Missing GOOGLE_MAPS_KEY" });

    console.log(req.body);
    // Pulls request (user tells to go from HERE to THERE)
    let { origin, destination } = req.body || {};

    if (typeof origin === "string") {
      origin = await exports.getCoordinates(origin);
    }

    if (typeof destination === "string") {
      destination = await exports.getCoordinates(destination);
    }

    // Reject something if it is wrong
    if (
      !origin?.lat ||
      !origin?.lng ||
      !destination?.lat ||
      !destination?.lng
    ) {
      return res.status(400).json({
        ok: false,
        error: "Send origin and destination as {lat, lng}",
      });
    }

    // Getting info from Directions API
    const r = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: "walking",
          alternatives: true,
          key: mapsKey,
        },
      },
    );

    // Checking if getting info failed
    if (r.data.status !== "OK") {
      return res.status(502).json({
        ok: false,
        status: r.data.status,
        error_message: r.data.error_message || null,
      });
    }

    // Unpacking Google's data
    const routes = r.data.routes.map((route, i) => {
      // Grabbing journey
      const leg = route.legs?.[0];

      // Compressed blueprint of the path / turns into coordinates
      const decoded = polyline.decode(route.overview_polyline.points);

      // Creating the route
      return {
        route_id: `route_${i}`,
        distance_m: leg?.distance?.value,
        duration_s: leg?.duration?.value,
        polyline: route.overview_polyline.points,
        coords: decoded.map(([lat, lng]) => ({ lat, lng })),
      };
    });

    for (const route of routes) {
      const resp = await axios.post(
        `${BACKEND_URL}/internal/safety/score-route`,
        { coords: route.coords }
      );

      route.safetyScore = resp.data.safetyScore;
    }

    console.log(
      routes.map(r => ({
        route_id: r.route_id,
        duration: r.duration_s,
        safety: r.safetyScore
      }))
    );

    const maxDuration = Math.max(...routes.map(r => r.duration_s));
    const minDuration = Math.min(...routes.map(r => r.duration_s));

    function normalizeDuration(d) {
      if (maxDuration === minDuration) return 1;
      return 1 - (d - minDuration) / (maxDuration - minDuration);
    }

    for (const route of routes) {
      const normDuration = normalizeDuration(route.duration_s);

      route.combinedScore =
        0.7 * route.safetyScore +
        0.3 * normDuration;
    }

    // choose which route to send
    routes.sort((a, b) => b.combinedScore - a.combinedScore);

    const bestRoute = routes[0];

    // Sends everything to client
    res.json({
      ok: true,
      bestRoute,
      meta: {
        candidateCount: routes.length,
        selection: "safety_first_then_speed",
      },
    });
  } catch (e) {
    // If there is an error
    logger.error(e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});
