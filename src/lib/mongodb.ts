import mongoose from "mongoose";
import { ensureSurveyResponseIndexes } from "@/models/SurveyResponse";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env file");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  indexesReady: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  indexesReady: false,
};

global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    if (!cached.indexesReady) {
      await ensureSurveyResponseIndexes();
      cached.indexesReady = true;
    }
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  if (!cached.indexesReady) {
    await ensureSurveyResponseIndexes();
    cached.indexesReady = true;
  }

  return cached.conn;
}
