import { AzureChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as dotenv from "dotenv";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

dotenv.config();

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

  region: z
    .string()
    .describe("the name of the region the postcode is in, if available"),
});

const model = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
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

const postCodeTool = tool(
  async ({ postcode }) => {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${postcode}`
    );
    return response.json();
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

const agent = createReactAgent({
  llm: model,
  tools: [postCodeTool],
});

const messages: BaseMessage[] = [
  new SystemMessage(
    "Your job is to return structured responses to poscode lookups"
  ),
  new HumanMessage("Hello, please lookup the post code for 'AL1 1EX'"),
];

async function stream() {
  const stream = await agent.stream({ messages }, { streamMode: "updates" });

  for await (const step of stream) {
    if (step.done) {
      break;
    }
    if (step.agent) {
      step.agent.messages.forEach((message) => {
        if (message.content) console.log(JSON.parse(message.content));
      });
    }
  }
}

stream();
