import axios from "axios";

const routes = [
  {
    route_id: "route_0",
    duration_s: 600,
    coords: [
      { lat: 43.26, lng: -79.92 },
      { lat: 43.261, lng: -79.919 },
    ],
  },
  {
    route_id: "route_1",
    duration_s: 650,
    coords: [
      { lat: 43.26, lng: -79.92 },
      { lat: 43.265, lng: -79.915 },
    ],
  },
];

for (const route of routes) {
  const resp = await axios.post(
    "http://localhost:3000/internal/safety/score-route",
    { coords: route.coords }
  );
  route.safetyScore = resp.data.safetyScore;
}

console.log(
  routes.map(r => ({
    route: r.route_id,
    duration: r.duration_s,
    safety: r.safetyScore,
  }))
);