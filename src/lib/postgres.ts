import pg from "pg";
import { config } from "@config/env";
import pino from "pino";

const options = {
  user: "prop",
  host: config.POSTGRES_HOST,
  database: "prop-db",
  password: config.POSTGRES_PASSWORD,
  port: 5432,
  ssl: true,
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
};

const { Pool } = pg;

const pool = new Pool(options);

pool.connect((err, _client, release) => {
  release(); // Release the client back to the pool
  if (err) {
    console.error("Connected to Postgres error:", err.stack);
    return;
  }
  console.log("Connected to Postgres");
});

async function queryDB(
  logger: pino.Logger,
  query: string,
  params: any[] = []
): Promise<any[]> {
  try {
    logger.info(`Querying database: ${query}`);
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    logger.error(`Querying database error: ${error}`);
    throw error;
  }
}

export { queryDB };
