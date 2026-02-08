// Load environment variables (Directions API Key)
require("dotenv").config();

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

    // Pulls request (user tells to go from HERE to THERE)
    const { origin, destination } = req.body || {};

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

    // PLACEHOLDER choose which route to send
    routes.sort((a, b) => a.duration_s - b.duration_s);
    const bestRoute = routes[0];

    // Sends everything to client
    res.json({
      ok: true,
      bestRoute,
      meta: {
        candidateCount: routes.length,
        selection: "fastest_duration_placeholder",
      },
    });
  } catch (e) {
    // If there is an error
    logger.error(e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});
