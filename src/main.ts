import express from "express";
import { loggingMiddleware } from "@middleware/logging";
import { corsMiddleware } from "@middleware/cors";
import { ping } from "@handler/ping";
import { streamMessagesToThread, getThreadHistory } from "@handler/thread";
import { authMiddleware } from "@middleware/auth";
import { createIndexHandler, uploadDocumentHandler } from "@handler/embeddings";

const app = express();
app.use(express.json());
app.use(loggingMiddleware());
app.use(corsMiddleware());
app.get("/ping", ping);
app.use(authMiddleware());
app.get("/thread/:threadId", getThreadHistory);
app.post("/thread/:threadId", streamMessagesToThread);
app.post("/embeddings", uploadDocumentHandler);
app.post("/index", createIndexHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🤖 Server is running on http://localhost:${PORT}`);
});
