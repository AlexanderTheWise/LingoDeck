import { type Response } from "express";
import jwt from "jsonwebtoken";
import type CustomError from "../../../CustomError/CustomError";
import { mockNext, mockResponse } from "../../../mocks/express.mock";
import { type CustomRequest } from "../../types.js";
import auth from "./auth.js";

const request = {} as Partial<CustomRequest> as CustomRequest;
const response = mockResponse as Response;
const next = mockNext;

afterEach(() => {
  next.mockClear();
});

describe("Given an auth middleware", () => {
  describe("When it receives a request with authorization 'Bearer RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo'", () => {
    test("Then it should call next", () => {
      jwt.verify = jest.fn().mockReturnValue("");
      request.header = jest
        .fn()
        .mockReturnValue("Bearer RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo");

      auth(request, response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  const commonStatusCode = 403;
  const commonPublicMessage = "Invalid token";

  describe("When it receives a request without authorization header", () => {
    test("Then it should call next with authorization error", () => {
      request.header = jest.fn().mockReturnValue(undefined);

      auth(request, response, next);
      const { message, statusCode, publicMessage } = next.mock
        .calls[0][0] as CustomError;

      expect(message).toBe("Authorization header is missing");
      expect(statusCode).toBe(commonStatusCode);
      expect(publicMessage).toBe(publicMessage);
    });
  });

  describe("When it receives a request with authorization 'RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo'", () => {
    test("Then it should call next with authorization error", () => {
      request.header = jest
        .fn()
        .mockReturnValue("RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo");

      auth(request, response, next);
      const { message, statusCode, publicMessage } = next.mock
        .calls[0][0] as CustomError;

      expect(message).toBe("Missing 'Bearer' in authorization header");
      expect(statusCode).toBe(commonStatusCode);
      expect(publicMessage).toBe(commonPublicMessage);
    });
  });
});
