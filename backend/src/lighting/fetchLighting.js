import fetch from "node-fetch";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const BOUNDS = {
  south: 43.464,
  west: -80.554,
  north: 43.480,
  east: -80.535
};

// Generic Overpass fetcher
async function runOverpassQuery(query) {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status}`);
  }

  const data = await res.json();

  return data.elements;
}

// fetch lighting
export async function fetchStreetLights() {
  const query = `
    [out:json];
    node["highway"="street_lamp"]
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
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
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

      way["amenity"="restaurant"]
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
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
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

      way["amenity"="cafe"]
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
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
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

      node["public_transport"="platform"]
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
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
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

      way["shop"="convenience"]
      (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
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
    (${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

    out;
  `;

  return await runOverpassQuery(query);
}
