import { AzureChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Azure OpenAI model
const model = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
  streaming: false,
});

export { model };
