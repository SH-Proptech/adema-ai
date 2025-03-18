import {
  AIMessage,
  HumanMessage,
  MessageContent,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { systemMessage } from "./systemMessage";
import { model } from "@ai/llm";
import { tools } from "./tools";
import { redisCheckpointer } from "@lib/redis/redis";
import { messageModifier, trimmer } from "@ai/trimmer";
import pino from "pino";
import { RunnableConfig } from "@langchain/core/dist/runnables";

export type AppRunnableConfig = RunnableConfig<{
  threadId: string;
  logger: pino.Logger;
}>;

// Create the agent with memory management and trimming
const agent = createReactAgent({
  llm: model,
  tools,
  messageModifier,
  checkpointSaver: redisCheckpointer,
});

async function ask(
  logger: pino.Logger,
  threadId: string,
  input = "What can you do?"
) {
  logger.info("user: ", threadId, input);

  const config: AppRunnableConfig = {
    configurable: { threadId, logger },
    recursionLimit: 15,
  };

  try {
    const previousMessages = await redisCheckpointer.getTuple(config);

    // Define the messages for the conversation
    const messages = previousMessages
      ? [
          new HumanMessage(input), // User input
        ]
      : [new SystemMessage(systemMessage), new HumanMessage(input)];

    // Trim the messages to fit within the token limit
    const trimmedMessages = await trimmer(messages);
    const result = await agent.invoke(
      {
        messages: trimmedMessages,
      },
      config
    );

    // Extract text response
    const textResponse = result.messages.findLast(
      (msg) => msg instanceof AIMessage
    )?.content;

    // Extract tool outputs
    const toolOutputs = result.messages
      .filter((msg) => msg instanceof ToolMessage)
      .map((msg) => msg.content);

    const response = { text: textResponse, tools: toolOutputs };
    logger.info("adema:", threadId, response);
    return response;
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

export { ask };
