// University of Waterloo + Wilfrid Laurier campuses and the streets between them
// (roughly Columbia St to Erb St, Westmount Rd to King St), about 2.2 km x 3.6 km.
// Single source of truth for the map area: the API only routes inside it, and the
// seed script fetches OSM data and builds the safety grid over the same box, so every
// routable point has safety data.
export const SERVICE_AREA = {
  south: 43.462,
  west: -80.56,
  north: 43.482,
  east: -80.515,
};

// True when the point is inside SERVICE_AREA (edges included).
export function isInServiceArea(lat, lng) {
  const a = SERVICE_AREA;
  return lat >= a.south && lat <= a.north && lng >= a.west && lng <= a.east;
}

// "south,west,north,east": the bounding-box format Overpass QL expects.
export const SERVICE_AREA_BBOX = [
  SERVICE_AREA.south,
  SERVICE_AREA.west,
  SERVICE_AREA.north,
  SERVICE_AREA.east,
].join(",");
