import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME || "labforge";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!clientPromise) {
    const opts = {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    };

    client = new MongoClient(uri, opts);
    clientPromise = client.connect().catch((err) => {
      client = null;
      clientPromise = null;
      throw new Error(`Failed to connect to MongoDB: ${err.message}`);
    });
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(dbName);
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  dbName: string;
  pingMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const pingMs = Date.now() - startTime;
    return {
      connected: true,
      dbName,
      pingMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      dbName,
      pingMs: Date.now() - startTime,
      error: err.message || "Database connection failed",
    };
  }
}
