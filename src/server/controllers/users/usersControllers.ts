import "../../../loadEnvironment.js";
import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../../database/models/User.js";
import { type LoginUserPayload, type UserCredentials } from "../../types.js";
import CustomError from "../../../CustomError/CustomError.js";

export const loginUser = async (
  request: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    UserCredentials
  >,
  response: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username }).exec();

    if (!user) {
      throw new Error("Couldn't find user with given name");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new Error("Password doesn't match indicated");
    }

    const loginUserPayload: LoginUserPayload = {
      id: user._id.toString(),
      username: user.username,
    };

    const token = jwt.sign(loginUserPayload, process.env.JWT_SECRET!);

    response.status(201).json({ token });
  } catch (error) {
    const wrongCredentials = new CustomError(
      (error as Error).message,
      401,
      "Wrong credentials"
    );

    next(wrongCredentials);
  }
};

export const registerUser = async (
  request: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    UserCredentials
  >,
  response: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = request.body;

    if (await User.findOne({ username }).exec()) {
      throw new Error("Username already exists");
    }

    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 10),
    });

    response.status(201).json({
      message: `User ${user.username} has been succesfully created`,
    });
  } catch (error) {
    const registerError = new CustomError(
      (error as Error).message,
      0,
      "Couldn't create the user"
    );

    next(registerError);
  }
};
