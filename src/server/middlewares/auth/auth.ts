import { type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../../../CustomError/CustomError.js";
import { type CustomRequest } from "../../types.js";

const auth = (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = request.header("authorization");

    if (!authorizationHeader) {
      throw new Error("Authorization header is missing");
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      throw new Error("Missing 'Bearer' in authorization header");
    }

    const token = authorizationHeader.replace(/^Bearer\s*/, "");
    const { id } = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    request.userId = id;
    next();
  } catch (error) {
    const authorizationError = new CustomError(
      (error as Error).message,
      403,
      "Invalid token"
    );

    next(authorizationError);
  }
};

export default auth;
