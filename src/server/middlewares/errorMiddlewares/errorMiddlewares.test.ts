import { type Request, type Response } from "express";
import CustomError from "../../../CustomError/CustomError";
import { endpointNotFound, errorHandler } from "./errorMiddlewares";
import { mockNext, mockResponse } from "../../../mocks/express.mock";

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

describe("Given an errorHandler middleware", () => {
  describe("When it receives an invalid request error", () => {
    const invalidRequest = new CustomError(
      "Invalid request",
      400,
      "Sorry, your request was invalid"
    );

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
