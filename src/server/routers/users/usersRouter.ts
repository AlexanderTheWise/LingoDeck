import { Router } from "express";
import { validate } from "express-validation";
import { loginUser } from "../../controllers/users/usersControllers.js";
import credentials from "../../schemas/credentials.js";

const usersRouter = Router();

usersRouter.post(
  "/login",
  validate(credentials, {}, { abortEarly: false }),
  loginUser
);

export default usersRouter;
