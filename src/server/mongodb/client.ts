import { Db, MongoClient } from "mongodb";
import { env } from "../config/env.js";
import { HttpError } from "../http/errors.js";

let client: MongoClient | null = null;
let connection: Promise<MongoClient> | null = null;

function requireConnectionString() {
  if (!env.MONGODB_CONNECTION_STRING) {
    throw new HttpError(
      503,
      "DATABASE_NOT_CONFIGURED",
      "MongoDB is not configured. Set MONGODB_CONNECTION_STRING to enable data routes.",
    );
  }
  return env.MONGODB_CONNECTION_STRING;
}

export async function getMongoDatabase(): Promise<Db> {
  if (!connection) {
    client = new MongoClient(requireConnectionString());
    connection = client.connect();
  }

  const connectedClient = await connection;
  return connectedClient.db("default");
}
