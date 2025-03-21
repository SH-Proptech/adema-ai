import { RedisVectorStore } from "@langchain/redis";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { config } from "@config/env";
import { createClient } from "redis"; // Import the 'redis' package
import type { Document } from "@langchain/core/documents";

// Create a Redis client using the 'redis' package
const client = createClient({
  url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`, // Your Redis URL
  password: config.REDIS_PASSWORD, // Your Redis password (if any)
  database: config.REDIS_DB + 1, // Your Redis database number
});

const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: config.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: config.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: "ada-002",
  azureOpenAIApiVersion: config.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: `${config.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
  verbose: true,
});

async function connectToRedis() {
  await client.connect();
  console.log("Connected to Redis for Vector Store");

  // Initialize the RedisVectorStore with the embeddings and Redis client
  const vectorStore = new RedisVectorStore(embeddings, {
    redisClient: client, // Use the 'redis' client here
    indexName: "langchainjs-testing",
  });

  return vectorStore;
}

const document1: Document = {
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { type: "example" },
};

const document2: Document = {
  pageContent: "Buildings are made out of brick",
  metadata: { type: "example" },
};

const document3: Document = {
  pageContent: "Mitochondria are made out of lipids",
  metadata: { type: "example" },
};

const document4: Document = {
  pageContent: "The 2024 Olympics are in Paris",
  metadata: { type: "example" },
};

async function addDocuments() {
  const documents = [document1, document2, document3, document4];
  const vectorStore = await connectToRedis(); // Establish connection to Redis
  return vectorStore.addDocuments(documents);
}

export { addDocuments };
