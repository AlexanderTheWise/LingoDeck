import { ValidationError } from "express-validation";
import { type Response } from "express";
import { type CustomFile } from "../server/types";

export const mockResponse: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
export const mockNext = jest.fn();

export const mockValidationError = new ValidationError(
  {
    body: [
      {
        name: "ValidationError",
        isJoi: true,
        annotate(stripColors) {
          return "";
        },
        _original: "",
        message: "",
        details: [
          {
            message: "",
            path: [""],
            type: "",
          },
        ],
      },
    ],
  },
  {}
);

export const file: Partial<CustomFile> = {
  convertedName: "exampleImage.jpg",
  destination: "uploads",
};
