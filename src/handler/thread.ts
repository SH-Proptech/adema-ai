import { Request, Response } from "express";
import { askStream } from "../langchain";
import {
  isAIMessage,
  isAIMessageChunk,
  isHumanMessage,
} from "@langchain/core/messages";
import { redisCheckpointer } from "@lib/redis/redisCheckpointer";

const streamMessagesToThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { threadId } = req.params;
  const { message } = req.body;

  req.log.debug("addMessageToThread");

  if (!threadId || !message) {
    res.status(400).json({ error: "Thread ID and message are required" });
    return;
  }

  try {
    await askStream(req.log, threadId, message, res);
  } catch (error) {
    console.error("Error during conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getThreadHistory = async (req: Request, res: Response): Promise<any> => {
  const { threadId } = req.params;

  req.log.debug("getThreadHistory", { threadId });

  try {
    const previousMessages = await redisCheckpointer.getTuple({
      configurable: { threadId },
    });

    if (!previousMessages) {
      return res.status(404).json({ message: "History not found" });
    }

    const { messages } = previousMessages.checkpoint.channel_values as {
      messages: any[];
    };
    if (!Array.isArray(messages)) {
      return res.status(404).json({ message: "History not found" });
    }

    // Filter and map messages using instanceof
    const filteredMessages = messages
      .filter(
        (msg: any) =>
          (isHumanMessage(msg) || isAIMessage(msg) || isAIMessageChunk(msg)) &&
          msg.content !== ""
      )
      .map((msg: any) => ({
        content: msg.content,
        isUser: isHumanMessage(msg),
        id: msg.id,
      }));

    res.json({ messages: filteredMessages });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching history", error: error.message });
  }
};

export { getThreadHistory, streamMessagesToThread };
