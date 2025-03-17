import { tool } from "@langchain/core/tools";
import { queryDB } from "./lib/postgres";
import { z } from "zod";
import { getPostcodeByCode, getPostCodeByLatLong } from "./lib/postcode";
import { createStaticMap, lookupAddress } from "./lib/google";
import * as Terraformer from "terraformer-wkt-parser"; // WKT to GeoJSON parser
import {
  lookupCareHomePlanningInformation,
  lookupFreeholdInformation,
  lookupSourcedProperties,
  lookupTitleInformation,
} from "./lib/propertyData";

// Define the types for the tool input
interface DBQueryInput {
  query: string;
}

// Define a tool for executing SQL queries
const dbTool = tool(
  async (input: DBQueryInput) => {
    try {
      const result = await queryDB(input.query);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error executing query: ${error.message}`;
    }
  },
  {
    name: "DatabaseQuery",
    description:
      "This tool allows you to query the database and get results. Be careful not to request geometry data unless required.",
    schema: z.object({
      query: z.string(),
    }),
  }
);

// Define the types for the postcode lookup input
interface PostcodeLookupInput {
  postcode: string;
}

// Define a tool for looking up UK postcodes
const postcodeLookupTool = tool(
  async (input: PostcodeLookupInput) => {
    try {
      return getPostcodeByCode(input.postcode);
    } catch (error: any) {
      return `Error looking up postcode: ${error.message}`;
    }
  },
  {
    name: "PostcodeLookup",
    description:
      "This tool allows you to look up UK postcodes using a postcode and get detailed information.",
    schema: z.object({
      postcode: z.string(),
    }),
  }
);

// Define the types for the lat/long lookup input
interface LatLongLookupInput {
  latitude: number;
  longitude: number;
}

// Define a tool for looking up UK postcodes via latitude and longitude
const latLongLookupTool = tool(
  async (input: LatLongLookupInput) => {
    try {
      return getPostCodeByLatLong(input.latitude, input.longitude);
    } catch (error: any) {
      return `Error looking up postcode: ${error.message}`;
    }
  },
  {
    name: "LatLongLookup",
    description:
      "This tool allows you to look up UK postcodes using latitude and longitude.",
    schema: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }
);

// Define the tool expecting WKT as the geometry format
const mapTool = tool(
  async (input: {
    latitude: number;
    longitude: number;
    zoom: number;
    geometry?: string;
  }) => {
    let geometryData;

    if (input.geometry) {
      try {
        // Attempt to convert WKT to GeoJSON
        geometryData = convertWKTtoGeoJSON(input.geometry);
        if (!geometryData) {
          return { error: "Invalid WKT geometry format." };
        }
      } catch (error) {
        console.error("Error processing WKT:", error);
        return { error: "Error processing WKT geometry." };
      }
    }

    return createStaticMap({
      latitude: input.latitude,
      longitude: input.longitude,
      zoom: input.zoom,
      geometry: geometryData ? JSON.stringify(geometryData) : undefined,
    });
  },
  {
    name: "MapLookup",
    description:
      "Get a google static map image of a location using latitude and longitude and zoom (to fit the polygon), with optional WKT geometry (polygons). The location must be in EPSG:4326. It is highly likely you need to transform the coordinates to this format latitude and longitude (WGS84)",
    schema: z.object({
      latitude: z.number(),
      longitude: z.number(),
      zoom: z.number(),
      geometry: z.string().optional(), // WKT string geometry
    }),
  }
);

// Function to convert WKT to GeoJSON
function convertWKTtoGeoJSON(wkt: string) {
  try {
    const geoJson = Terraformer.parse(wkt);
    return geoJson;
  } catch (error) {
    console.error("Error converting WKT to GeoJSON:", error);
    return null;
  }
}

const address = tool(
  async (input: { address: string }) => {
    return lookupAddress(input);
  },
  {
    name: "AddressLookup",
    description:
      "Get the latitude and longitude of an address using the Google Maps API",
    schema: z.object({
      address: z.string(),
    }),
  }
);

// Define the types for the freehold information lookup input
interface FreeholdLookupInput {
  latitude: number;
  longitude: number;
}

// Define a tool for looking up freehold information
const freeholdLookupTool = tool(
  async (input: FreeholdLookupInput) => {
    try {
      return lookupFreeholdInformation(input.latitude, input.longitude);
    } catch (error: any) {
      return `Error looking up freehold information: ${error.message}`;
    }
  },
  {
    name: "FreeholdLookup",
    description:
      "This tool allows you to look up freehold land title numbers and associated information using latitude and longitude.",
    schema: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }
);

// Define the types for the title information lookup input
interface TitleLookupInput {
  title: string;
}

// Define a tool for looking up title information
const titleLookupTool = tool(
  async (input: TitleLookupInput) => {
    try {
      return lookupTitleInformation(input.title);
    } catch (error: any) {
      return `Error looking up title information: ${error.message}`;
    }
  },
  {
    name: "TitleLookup",
    description:
      "This tool allows you to look up title information for a given land title number.",
    schema: z.object({
      title: z.string(),
    }),
  }
);

// Define the types for the care home planning information lookup input
interface CareHomePlanningLookupInput {
  latitude: number;
  longitude: number;
}

// Define a tool for looking up care home planning information
const careHomePlanningLookupTool = tool(
  async (input: CareHomePlanningLookupInput) => {
    try {
      return lookupCareHomePlanningInformation(input.latitude, input.longitude);
    } catch (error: any) {
      return `Error looking up care home planning information: ${error.message}`;
    }
  },
  {
    name: "CareHomePlanningLookup",
    description:
      "This tool allows you to look up the closest care home planning applications using latitude and longitude.",
    schema: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }
);

// Define the types for the sourced properties lookup input
interface SourcedPropertiesLookupInput {
  latitude: number;
  longitude: number;
  list: string;
}

// Define a tool for looking up sourced properties
const sourcedPropertiesLookupTool = tool(
  async (input: SourcedPropertiesLookupInput) => {
    try {
      return lookupSourcedProperties(
        input.latitude,
        input.longitude,
        input.list
      );
    } catch (error: any) {
      return `Error looking up sourced properties: ${error.message}`;
    }
  },
  {
    name: "SourcedPropertiesLookup",
    description: `
      This tool allows you to look up properties on specialist situation property sourcing lists within a given radius of a supplied location.
      possible list values: 
      'repossessed-properties'
      'unmodernised-properties'
      'land-plots-for-sale'
      'hmo-licenced-properties'
      'reduced-properties'
      'slow-to-sell-properties'
      'properties-with-good-views'
      'properties-near-great-school'
      'properties-with-planning-granted'
      'large-properties'
      'cheap-per-square-foot'
      'near-large-development'
      'near-green-space'
      'high-population-growth'
      'mixed-use'
      'walking-distance-to-town-centre'
      `,
    schema: z.object({
      latitude: z.number(),
      longitude: z.number(),
      list: z.string(),
    }),
  }
);

const tools = [
  dbTool,
  postcodeLookupTool,
  latLongLookupTool,
  mapTool,
  address,
  freeholdLookupTool,
  titleLookupTool,
  careHomePlanningLookupTool,
  sourcedPropertiesLookupTool,
];

export { tools };
