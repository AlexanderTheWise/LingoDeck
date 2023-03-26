import express from "express";
import morgan from "morgan";
import {
  endpointNotFound,
  errorHandler,
  validationError,
} from "./middlewares/errorMiddlewares/errorMiddlewares.js";
import usersRouter from "./routers/users/usersRouter.js";

const app = express();

app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(express.json());

app.use("/user", usersRouter);
app.use(validationError);
app.use(endpointNotFound);
app.use(errorHandler);

export default app;
