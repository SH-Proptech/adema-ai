import { Handler } from "express";
import { pinoHttp } from "pino-http";

function loggingMiddleware(): Handler {
  return pinoHttp({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });
}

export { loggingMiddleware };
