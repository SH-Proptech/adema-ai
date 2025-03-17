import { Handler } from "express";
import { pinoHttp } from "pino-http";

function loggingMiddleware(): Handler {
  return pinoHttp({
    level: "debug", // Set the log level to 'debug' or 'info' as needed
    transport: {
      target: "pino-pretty", // Use pino-pretty for human-readable logs
      options: {
        colorize: true, // Colorize logs for easy reading
        translateTime: "SYS:standard", // Show timestamp
        ignore: "pid,hostname", // Ignore pid and hostname fields
        singleLine: true, // Ensure each log message is on a single line
        messageFormat: "{msg}", // Only display the message (no extra data)
      },
    },
  });
}

export { loggingMiddleware };
