import { config } from "@config/env";
import pino from "pino";

function createStaticMap(input: {
  logger: pino.Logger;
  latitude: number;
  longitude: number;
  zoom: number;
  geometry?: string;
}) {
  input.logger.info(
    `Creating static map for lat: ${input.latitude}, long: ${input.longitude}`
  );

  let baseUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${input.latitude},${input.longitude}&zoom=${input.zoom}&size=600x400&maptype=roadmap&key=${config.GOOGLE_MAPS_API_KEY}`;

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

function lookupAddress(input: { logger: pino.Logger; address: string }) {
  input.logger.info(`Looking up address: ${input.address}`);
  const baseUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    input.address
  )}&key=${config.GOOGLE_MAPS_API_KEY}`;

  return fetch(baseUrl)
    .then((response) => response.json())
    .then((data: any) => {
      if (data.status === "OK") {
        return data.results[0].geometry.location;
      } else {
        throw new Error("Address lookup failed");
      }
    });
}

export { createStaticMap, lookupAddress };
