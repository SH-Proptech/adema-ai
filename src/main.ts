import express from "express";
import { loggingMiddleware } from "@middleware/logging";
import { corsMiddleware } from "@middleware/cors";
import { ping } from "@handler/ping";
import { addMessageToThread, getThreadHistory } from "@handler/thread";
import { authMiddleware } from "@middleware/auth";

const app = express();
app.use(express.json());
app.use(loggingMiddleware());

app.use(corsMiddleware());
app.use(authMiddleware());

app.get("/ping", ping);
app.get("/thread/:threadId", getThreadHistory);
app.post("/thread/:threadId", addMessageToThread);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🤖 Server is running on http://localhost:${PORT}`);
});
