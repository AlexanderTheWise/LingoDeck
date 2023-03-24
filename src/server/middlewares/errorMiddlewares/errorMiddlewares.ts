import { type NextFunction, type Response, type Request } from "express";
import CustomError from "../../../CustomError/CustomError";

export const endpointNotFound = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const endpointNotFoundError = new CustomError(
    "Endpoint not found",
    404,
    "The resource you were searching couldn't be found"
  );

  next(endpointNotFoundError);
};
