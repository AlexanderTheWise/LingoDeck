import { type NextFunction, type Response, type Request } from "express";
import { ValidationError } from "express-validation";
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

export const validationError = (
  error: CustomError | ValidationError,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error instanceof ValidationError) {
    const validationErrorMessage = error.details
      .body!.map((error) => error.message)
      .join(" && ");

    const validationError = new CustomError(
      validationErrorMessage,
      400,
      "Validation has failed"
    );

    next(validationError);
  }

  next(error);
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
