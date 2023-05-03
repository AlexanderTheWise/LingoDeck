import "../loadEnvironment.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  endpointNotFound,
  errorHandler,
  validationError,
} from "./middlewares/errors/errorMiddlewares.js";
import flashcardsRouter from "./routers/flashcards/flashcardsRouter.js";
import usersRouter from "./routers/users/usersRouter.js";

const origin = process.env.ORIGIN!;

const app = express();
const options: cors.CorsOptions = {
  origin,
};

app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(cors(options));
app.use(express.json());

app.use("/user", usersRouter);
app.use("/flashcards", flashcardsRouter);
app.use(validationError);
app.use(endpointNotFound);
app.use(errorHandler);

export default app;
