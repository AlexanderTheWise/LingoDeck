import "../loadEnvironment.js";
import createDebug from "debug";
import app from "./app.js";
import type CustomError from "../CustomError/CustomError.js";

const debug = createDebug("lingodeck:startServer");

const startServer = async (port: number) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      debug(`Server is listening on port ${port}`);

      resolve(server);
    });

    server.on("error", (error: CustomError) => {
      let errorMessage = "Error on starting the server";

      if (error.code === "EADDRINUSE") {
        errorMessage += ` There's another server running on ${port}`;
        debug(errorMessage);
      }

      debug(errorMessage);
    });
  });

export default startServer;
