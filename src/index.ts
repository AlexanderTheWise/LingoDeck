import connectDatabase from "./database/connectDatabase.js";
import "./loadEnvironment.js";
import startServer from "./server/startServer.js";

const port = process.env.PORT ?? 4000;
const databaseUrl = process.env.MONGO_DB_URL!;

(async () => {
  await connectDatabase(databaseUrl);
})();

(async () => {
  await startServer(+port);
})();
