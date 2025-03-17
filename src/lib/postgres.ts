import pg from "pg";
import * as dotenv from "dotenv";
import { err, log } from "../util/log";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: "prop",
  host: process.env.PG_HOST,
  database: "prop-db",
  password: process.env.PG_PASSWORD,
  port: 5432,
  ssl: true,
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

async function queryDB(query: string, params: any[] = []): Promise<any[]> {
  log(`Querying database: ${query}`);
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    err(`Querying database error: ${error}`);
    throw error;
  }
}

export { queryDB };
