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
