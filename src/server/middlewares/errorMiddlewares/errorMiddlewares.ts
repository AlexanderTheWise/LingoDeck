import { type NextFunction, type Response, type Request } from "express";
import createDebug from "debug";
import CustomError from "../../../CustomError/CustomError";

const debug = createDebug("lingodeck:errorsMiddlewares");

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

export const errorHandler = (
  { message, publicMessage, statusCode }: CustomError,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  debug(message);

  response
    .status(statusCode || 500)
    .json({ message: publicMessage || "Something went wrong" });
};
