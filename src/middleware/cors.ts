import cors from "cors";

function corsMiddleware() {
  return cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  });
}

export { corsMiddleware };
