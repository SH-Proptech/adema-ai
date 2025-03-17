import { RedisCheckpointSaver } from "./redisCheckpointer";
import * as dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

// Create the Redis connection instance using ioredis
const redisConnection = new Redis({
  host: "localhost",
  password: process.env.REDIS_PASSWORD, // Use the password from environment variables
  port: 6379,
  db: 4,
});

// Instantiate the RedisCheckpointSaver with the Redis connection, serializer, and TTL
const redisCheckpointer = new RedisCheckpointSaver(
  { connection: redisConnection } // Connection parameter
);

export { redisCheckpointer };
