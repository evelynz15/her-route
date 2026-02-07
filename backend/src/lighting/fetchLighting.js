import fetch from "node-fetch";

export async function fetchStreetLights() {
  const query = `
    [out:json];
    node["highway"="street_lamp"]
      (43.648,-79.395,43.660,-79.375);
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
