import {
  AIMessageChunk,
  BaseMessageChunk,
  HumanMessage,
  isAIMessageChunk,
  SystemMessage,
} from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { systemMessage } from "./systemMessage";
import { model, StructuredResponse } from "@ai/llm";
import { tools } from "./tools";
import { messageModifier, trimmer } from "@ai/trimmer";
import pino from "pino";
import { RunnableConfig } from "@langchain/core/dist/runnables";
import { Response } from "express";
import { redisCheckpointer } from "@lib/redis/redisCheckpointer";

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
            const parsed = parse(chunk);
            res.write(`data: ${JSON.stringify(parsed)}\n\n`);
          }
        });
      }
    }

    // Signal completion only if there were valid messages
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Streaming Error:", error.message);
    res.write(
      `data: ${JSON.stringify({ error: "Error processing request" })}\n\n`
    );
    res.end();
  }
}

type Answer = {
  content: StructuredResponse;
  id: string;
  isUser: boolean;
};

function parse(chunk: AIMessageChunk): Answer | null {
  // If content is an array, convert to string and then trim
  const content = Array.isArray(chunk.content)
    ? chunk.content.join(" ")
    : chunk.content;

  const id = chunk.id || "unknown";

  if (typeof content === "string" && content.trim()) {
    const parsed = JSON.parse(content);
    return { content: parsed, id, isUser: false };
  }

  return null;
}

export { askStream };
