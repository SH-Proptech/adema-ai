import {
  BaseMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import { AzureChatOpenAI } from "@langchain/openai";
import { systemMessage } from "../systemMessage";

// Set up the token trimmer
const trimmer = (messages: BaseMessage[]) =>
  trimMessages(messages, {
    maxTokens: 120_000, // Adjust based on your model's token limit (e.g., 8192 for GPT-4)
    strategy: "last", // Trim the most recent messages if the token count exceeds maxTokens
    tokenCounter: new AzureChatOpenAI({ modelName: "o3-mini" }), // Use the model to count tokens accurately
    includeSystem: true, // Include the system message if required
    allowPartial: false, // Do not allow partial tokens (to prevent exceeding the limit)
    startOn: "human", // Start trimming from the human messages (or adjust based on your needs)
  });

// Keep only the latest system message and remove any previous ones
const filterSingleSystemMessage = (messages: BaseMessage[]) => {
  // Remove any existing system messages
  const filtered = messages.filter(
    (message) => !(message instanceof SystemMessage)
  );

  // Add the latest system message at the beginning
  return [new SystemMessage(systemMessage), ...filtered];
};

const messageModifier = async (messages: BaseMessage[]) => {
  messages = filterSingleSystemMessage(messages);
  messages = await trimmer(messages);
  return messages;
};

export { trimmer, messageModifier };
