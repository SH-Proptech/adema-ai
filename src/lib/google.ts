import * as dotenv from "dotenv";
import { log } from "../util/log";

dotenv.config();

function createStaticMap(input: {
  latitude: number;
  longitude: number;
  zoom: number;
  geometry?: string;
}) {
  log(
    `Creating static map for lat: ${input.latitude}, long: ${input.longitude}`
  );

  let baseUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${input.latitude},${input.longitude}&zoom=${input.zoom}&size=600x400&maptype=roadmap&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  if (input.geometry) {
    try {
      const geoJSON = JSON.parse(input.geometry);

      if (geoJSON.type === "Polygon") {
        const coordinates = geoJSON.coordinates[0]; // Get outer ring
        const pathString = coordinates
          .map(([lng, lat]: [number, number]) => `${lat},${lng}`)
          .join("|");

        baseUrl += `&path=color:0xff0000ff|weight:3|${pathString}`;
      }
    } catch (error) {
      console.error("Invalid GeoJSON format:", error);
    }
  }

  return { type: "map", content: baseUrl };
}

function lookupAddress(input: { address: string }) {
  log(`Looking up address: ${input.address}`);
  const baseUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    input.address
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  return fetch(baseUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK") {
        return data.results[0].geometry.location;
      } else {
        throw new Error("Address lookup failed");
      }
    });
}

export { createStaticMap, lookupAddress };
