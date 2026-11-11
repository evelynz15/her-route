import { SERVICE_AREA_BBOX as BBOX } from "../config/areas.js";

const OVERPASS_URL = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";

// Overpass rejects requests with Node's default User-Agent (HTTP 406), and its usage
// policy asks clients to identify themselves.
const USER_AGENT = process.env.OVERPASS_USER_AGENT || "safety-data-seed/1.0";

// Statuses Overpass returns when it is overloaded or rate limiting; worth retrying.
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 200_000; // a bit above Overpass's default 180s query timeout

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generic Overpass fetcher, with backoff retries when the server is busy
async function runOverpassQuery(query) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "User-Agent": USER_AGENT },
        body: query,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) throw new Error(`Overpass request failed: ${error.message}`);
    }

    if (res?.ok) {
      const data = await res.json();
      return data.elements;
    }
    if (res && (!RETRYABLE_STATUSES.has(res.status) || attempt >= MAX_ATTEMPTS)) {
      throw new Error(`Overpass API error: ${res.status}`);
    }

    const delayS = 15 * attempt;
    console.warn(`Overpass busy (${res ? res.status : "network error"}), retrying in ${delayS}s...`);
    await sleep(delayS * 1000);
  }
}

// fetch lighting
export async function fetchStreetLights() {
  const query = `
    [out:json];
    node["highway"="street_lamp"]
      (${BBOX});
    out;
  `;

  return await runOverpassQuery(query);
}

// fetch restaurants
export async function fetchRestaurants() {
  const query = `
    [out:json];

    (
      node["amenity"="restaurant"]
      (${BBOX});

      way["amenity"="restaurant"]
      (${BBOX});
    );

    out center;
  `;

  return await runOverpassQuery(query);
}

// fetch cafes
export async function fetchCafes() {
  const query = `
    [out:json];

    (
      node["amenity"="cafe"]
      (${BBOX});

      way["amenity"="cafe"]
      (${BBOX});
    );

    out center;
  `;

  return await runOverpassQuery(query);
}

// Fetch transit stops
export async function fetchTransitStops() {
  const query = `
    [out:json];

    (
      node["highway"="bus_stop"]
      (${BBOX});

      node["public_transport"="platform"]
      (${BBOX});
    );

    out;
  `;

  return await runOverpassQuery(query);
}

// fetch convenience stores
export async function fetchConvenienceStores() {
  const query = `
    [out:json];

    (
      node["shop"="convenience"]
      (${BBOX});

      way["shop"="convenience"]
      (${BBOX});
    );

    out center;
  `;

  return await runOverpassQuery(query);
}

// fetch surveillance cameras
export async function fetchCameras() {
  const query = `
    [out:json];

    node["man_made"="surveillance"]
    (${BBOX});

    out;
  `;

  return await runOverpassQuery(query);
}
