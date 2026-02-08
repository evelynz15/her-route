import fetch from "node-fetch";

export async function fetchStreetLights() {
  const query = `
    [out:json];
    node["highway"="street_lamp"]
      (43.258,-79.923,43.266,-79.912);
    out;
  `;

  const res = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: query
    }
  );

  const data = await res.json();
  return data.elements;
}
