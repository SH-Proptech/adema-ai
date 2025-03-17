import pino from "pino";

const url = "https://api.postcodes.io/postcodes";

async function getPostcodeByCode(
  logger: pino.Logger,
  postcode: string
): Promise<Promise<any>> {
  logger.info(`Looking up postcode: ${postcode}`);

  const response = await fetch(`${url}/${postcode}`);
  const data: any = await response.json();
  if (data.status === 200) {
    return JSON.stringify(data.result);
  } else {
    return `Error: ${data.error}`;
  }
}

async function getPostCodeByLatLong(
  logger: pino.Logger,
  latitude: number,
  longitude: number
): Promise<Promise<any>> {
  logger.info(`Looking up postcode for lat: ${latitude}, long: ${longitude}`);

  const response = await fetch(`${url}?lon=${longitude}&lat=${latitude}`);
  const data: any = await response.json();
  if (data.status === 200) {
    return JSON.stringify(data.result);
  } else {
    return `Error: ${data.error}`;
  }
}

export { getPostcodeByCode, getPostCodeByLatLong };
