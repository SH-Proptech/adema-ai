import {
  AIMessage,
  AIMessageChunk,
  BaseMessageChunk,
  HumanMessage,
  isAIMessageChunk,
  isToolMessage,
  isToolMessageChunk,
  SystemMessage,
  ToolMessage,
  ToolMessageChunk,
} from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { systemMessage } from "./systemMessage";
import { model } from "@ai/llm";
import { tools } from "./tools";
import { redisCheckpointer } from "@lib/redis/redis";
import { messageModifier, trimmer } from "@ai/trimmer";
import pino from "pino";
import { RunnableConfig } from "@langchain/core/dist/runnables";
import { Response } from "express";

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

async function askStream(
  logger: pino.Logger,
  threadId: string,
  input: string,
  res: Response
) {
  logger.info("user:", threadId, input);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const previousMessages = await redisCheckpointer.getTuple({
      configurable: { threadId, logger },
      recursionLimit: 15,
    });

    const messages = previousMessages
      ? [new HumanMessage(input)]
      : [new SystemMessage(systemMessage), new HumanMessage(input)];

    const trimmedMessages = await trimmer(messages);

    // Stream the response from the model
    const stream = await agent.stream(
      { messages: trimmedMessages },
      { configurable: { threadId, logger }, streamMode: "updates" }
    );

    // Stream updates step-by-step
    for await (const step of stream) {
      if (step.agent?.messages) {
        step.agent.messages.forEach((chunk: BaseMessageChunk) => {
          if (isAIMessageChunk(chunk) && chunk.content) {
            res.write(`data: ${JSON.stringify({ text: chunk.content })}\n\n`);
          }
        });
      }

      if (step.tools?.messages) {
        // may need to check for isToolMessage
        const toolMessage = step.tools.messages.find(isToolMessage);
        if (toolMessage?.content) {
          res.write(
            `data: ${JSON.stringify({ tool: toolMessage.content })}\n\n`
          );
        }
      }
    }

    res.write("data: [DONE]\n\n"); // Signal completion
    res.end();
  } catch (error: any) {
    console.error("Streaming Error:", error.message);
    res.write(
      `data: ${JSON.stringify({ error: "Error processing request" })}\n\n`
    );
    res.end();
  }
}

export { askStream };
