import { type MongoMemoryServer } from "mongodb-memory-server";
import config from "./config";

export default async function globalTeardown() {
  if (config.Memory) {
    const instance = (global as any).__MONGOINSTANCE as MongoMemoryServer;
    await instance.stop();
  }
}
