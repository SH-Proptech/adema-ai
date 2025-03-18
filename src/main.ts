import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ask } from "./langchain";
import { loggingMiddleware } from "@middleware/logging";

dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON request body
app.use(loggingMiddleware()); // logging middleware

app.get("/ping", (req: Request, res: Response): void => {
  req.log.debug("/ping");
  res.send("Pong!");
});

app.post("/chat", async (req: Request, res: Response): Promise<void> => {
  req.log.debug("/chat");
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    res.status(400).json({ error: "Thread ID and message are required" });
    return;
  }

  try {
    const response = await ask(req.log, threadId, message);
    res.json({ response });
  } catch (error) {
    console.error("Error during conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🤖 Server is running on http://localhost:${PORT}`);
});
