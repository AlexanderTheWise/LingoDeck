import { Router } from "express";
import { validate } from "express-validation";
import {
  loginUser,
  registerUser,
} from "../../controllers/users/usersControllers.js";
import credentials from "../../schemas/credentials.js";

const usersRouter = Router();

usersRouter.post(
  "/login",
  validate(credentials, {}, { abortEarly: false }),
  loginUser
);

usersRouter.post(
  "/register",
  validate(credentials, {}, { abortEarly: false }),
  registerUser
);

export default usersRouter;
