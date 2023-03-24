import { type Request, type Response } from "express";
import CustomError from "../../../CustomError/CustomError";
import {
  endpointNotFound,
  errorHandler,
  validationError,
} from "./errorMiddlewares";
import {
  mockNext,
  mockResponse,
  mockValidationError,
} from "../../../mocks/express.mock";

beforeEach(() => {
  mockNext.mockClear();
});

const response = mockResponse as Response;
const request = {} as Request;
const next = mockNext;

describe("An endpointNotFound middleware", () => {
  it("Should next an enpointNotFound error", () => {
    endpointNotFound(request, response, next);
    const { message, publicMessage, statusCode } = next.mock
      .calls[0][0] as CustomError;

    expect(message).toBe("Endpoint not found");
    expect(publicMessage).toBe(
      "The resource you were searching couldn't be found"
    );
    expect(statusCode).toBe(404);
  });
});

const invalidRequest = new CustomError(
  "Invalid request",
  400,
  "Sorry, your request was invalid"
);

describe("Given a validationError middleware", () => {
  describe("When it receives a validation error", () => {
    test("Then it should call next with a validationError with status 400 and public message 'Validation has failed'", () => {
      validationError(mockValidationError, request, response, next);
      const { statusCode, publicMessage } = next.mock
        .calls[0][0] as CustomError;

      expect(statusCode).toBe(400);
      expect(publicMessage).toBe("Validation has failed");
    });
  });

  describe("When it receives a invalid request error", () => {
    test("Then it should call next with that invalid request error", () => {
      validationError(invalidRequest, request, response, next);
      const { publicMessage, statusCode, message } = next.mock
        .calls[0][0] as CustomError;

      expect(publicMessage).toBe("Sorry, your request was invalid");
      expect(statusCode).toBe(400);
      expect(message).toBe("Invalid request");
    });
  });
});

describe("Given an errorHandler middleware", () => {
  describe("When it receives an invalid request error", () => {
    test("Then it should respond with status 400 and message 'Sorry, your request was invalid'", () => {
      errorHandler(invalidRequest, request, response, next);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        message: "Sorry, your request was invalid",
      });
    });
  });

  describe("When it doesn't receive any error", () => {
    test("Then it should respond with status 500 and message 'Something went wrong'", () => {
      errorHandler({} as CustomError, request, response, next);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        message: "Something went wrong",
      });
    });
  });
});
