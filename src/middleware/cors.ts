import cors from "cors";

function corsMiddleware() {
  return cors({
    origin: "*",
    credentials: true,
    methods: ["OPTIONS", "GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}

export { corsMiddleware };
