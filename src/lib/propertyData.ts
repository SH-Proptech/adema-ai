import { config } from "@config/env";
import { log } from "../util/log";

async function propertyDataLookup(path: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.propertydata.co.uk/${path}&key=${config.PROPERTY_DATA_API_KEY}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// This endpoint returns freehold land title numbers, along with the title class and headline information
// about the associated polygons including approx centres and number of leaseholds.
function lookupFreeholdInformation(lat: number, long: number) {
  log(`Looking up freehold information for lat: ${lat}, long: ${long}`);

  return propertyDataLookup(`freeholds?location=${lat},${long}`);
}

// For a given land title number (freehold or leasehold) returns the following information:

//     Title class / estate interest
//     Ownership type[1]
//     Total plot size[2]
//     Number of polygons of land in title
//     List of polygons including polygon size [2], approximate polygon centre [3] and polygon co-ordinates [4]
//     Attached leaseholds
//     Attached UPRNs
function lookupTitleInformation(title: string) {
  log(`Looking up title information for title: ${title}`);
  return propertyDataLookup(`title?title=${title}`);
}

// This endpoint returns the closest care home planning applications.
function lookupCareHomePlanningInformation(lat: number, long: number) {
  log(
    `Looking up care home planning information for lat: ${lat}, long: ${long}`
  );
  return propertyDataLookup(
    `planning?location=${lat},${long}&category=CARE%20HOME`
  );
}

// This endpoint returns properties currently on any one of our specialist situation property sourcing lists,
// within a given radius of a supplied location. Properties are sorted by distance to the input location, where
// the closest properties are returned first.

// repossessed-properties
// unmodernised-properties
// cash-buyers-only-properties
// auction-properties
// quick-sale-properties
// land-plots-for-sale
// new-build-properties
// hmo-licenced-properties
// reduced-properties
// investment-portfolios
// back-on-market
// slow-to-sell-properties
// short-lease-properties
// georgian-houses
// holiday-let-properties
// high-yield-properties
// tenanted-properties-for-sale
// properties-with-good-views
// properties-near-great-school
// properties-with-no-chain
// properties-with-planning-granted
// properties-near-a-university
// properties-with-an-annexe
// large-properties
// properties-on-a-corner-plot
// bungalows-for-sale
// cheap-per-square-foot
// high-rental-demand
// near-large-development
// near-green-space
// high-population-growth
// suitable-for-splitting
// mixed-use
// walking-distance-to-town-centre
// one-to-two-bed-conversions
// two-to-three-bed-conversions

function lookupSourcedProperties(lat: number, long: number, list: string) {
  log(`Creating static map for lat: ${lat}, long: ${long}, list: ${list}`);
  return propertyDataLookup(
    `sourced-properties?list=${list}&location=${lat},${long}`
  );
}

export {
  lookupTitleInformation,
  lookupFreeholdInformation,
  lookupCareHomePlanningInformation,
  lookupSourcedProperties,
};
