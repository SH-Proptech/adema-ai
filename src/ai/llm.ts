import { config } from "@config/env";
import { AzureChatOpenAI } from "@langchain/openai";

// Initialize Azure OpenAI model
const model = new AzureChatOpenAI({
  azureOpenAIApiKey: config.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: config.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: config.AZURE_OPENAI_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: config.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: `${config.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
  streaming: false,
});

export { model };
