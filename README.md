# HerRoute

**A walking navigation app that picks the safest route, not just the fastest.**

Maps apps find the quickest way from A to B. At night, the quickest way is often not the one you want. HerRoute scores every candidate walking route on street lighting and nearby activity, using OpenStreetMap data, and recommends the one with the best balance of safety and travel time.

It currently covers the University of Waterloo and Wilfrid Laurier campuses and the streets between them.

**Stack:** React · TypeScript · Vite · Node.js · Express · MongoDB · OpenStreetMap (Overpass, OSRM, Photon)

---

## What it does

- **Address search with autocomplete.** Type a start and a destination and pick from suggestions biased toward the campus area.
- **Safety-ranked routing.** The backend requests up to 3 alternative walking routes, scores each one, and returns the best.
- **Clear safety breakdown.** Each route shows an overall safety score plus separate lighting and activity scores, drawn on an interactive map.
- **Night mode.** A dark UI theme for walking at night.

## How it works

**1. Building the safety grid (offline).** A seed script pulls street lamps and points of interest for the service area from OpenStreetMap's Overpass API. It lays a grid of about 3700 points (roughly every 50 m) over the area. For each point it counts lamps and venues within 90 m and computes:

- a **lighting score**: lamp count, normalized so 3+ lamps scores 1.0
- an **activity score**: a weighted count of nearby restaurants, cafés, transit stops and convenience stores (places where people are likely to be), normalized against the busiest point in the area
- a **safety score**: 60% lighting + 40% activity

**2. Scoring a route (per request).** For each route OSRM returns, the API:

1. Resamples the route to evenly spaced points every 50 m, so a long straight road counts as much as a twisty one, however many vertices the router returned. Samples are capped at 500 per route to bound the work.
2. Converts each sample to a geohash cell plus its 8 neighbours.
3. Fetches all matching safety nodes in **one** database query per route instead of one per point.
4. Averages the nearby scores along the route.

**3. Choosing the best route.** Each route gets a combined score of **70% safety + 30% speed**, with travel time normalized across the candidates. The highest-scoring route is returned.

