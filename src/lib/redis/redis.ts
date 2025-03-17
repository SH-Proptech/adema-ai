import { RedisCheckpointSaver } from "./redisCheckpointer";
import { Redis } from "ioredis";
import { config } from "@config/env";

// Create the Redis connection instance using ioredis
const redisConnection = new Redis({
  host: config.REDIS_HOST, // Use the host from environment variables
  password: config.REDIS_PASSWORD, // Use the password from environment variables
  port: config.REDIS_PORT,
  db: config.REDIS_DB,
});

redisConnection.on("connect", () => {
  console.log("Connected to Redis");
});

// Instantiate the RedisCheckpointSaver with the Redis connection, serializer, and TTL
const redisCheckpointer = new RedisCheckpointSaver(
  { connection: redisConnection } // Connection parameter
);

export { redisCheckpointer };
