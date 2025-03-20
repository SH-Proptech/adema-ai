import { config } from "@config/env";
import { AzureChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export interface StructuredResponse {
  text: string;
  location?: {
    lat: number;
    long: number;
  };
  propertyId?: string;
}

// Define a schema for your structured response
const structuredResponseSchema = z.object({
  text: z
    .string()
    .describe("The main text content of the response supplied as markdown"),

  location: z
    .object({
      lat: z.number().describe("Latitude of the location"),
      long: z.number().describe("Longitude of the location"),
    })
    .describe(
      "Any latitude and longitude found in the response should be aditionally supplied here"
    ),

  propertyId: z
    .string()
    .describe(
      "A propertyId refers to the id of any property from the database. If found in the response should be aditionally supplied here"
    ),
});

// Initialize Azure OpenAI model
const model = new AzureChatOpenAI({
  azureOpenAIApiKey: config.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: config.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: config.AZURE_OPENAI_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: config.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: `${config.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
  streaming: true,
  modelKwargs: {
    response_format: {
      type: "json_schema",
      json_schema: {
        strict: true,
        name: "GeneralResponse",
        schema: zodToJsonSchema(structuredResponseSchema),
      },
    },
  },
});

export { model };
