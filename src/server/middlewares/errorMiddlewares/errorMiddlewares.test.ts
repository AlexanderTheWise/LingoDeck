import { type Request, type Response } from "express";
import type CustomError from "../../../CustomError/CustomError";
import { endpointNotFound } from "./errorMiddlewares";

describe("An endpointNotFound error middleware", () => {
  it("Should next an enpointNotFound error", () => {
    const next = jest.fn();

    endpointNotFound({} as Request, {} as Response, next);
    const { message, publicMessage, statusCode } = next.mock
      .calls[0][0] as CustomError;

    expect(message).toBe("Endpoint not found");
    expect(publicMessage).toBe(
      "The resource you were searching couldn't be found"
    );
    expect(statusCode).toBe(404);
  });
});
