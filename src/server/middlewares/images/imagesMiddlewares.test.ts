import fs from "fs/promises";
import { type Response } from "express";
import { mockNext, mockResponse, file } from "../../../mocks/express.mock";
import { type CustomRequest } from "../../types";
import { format } from "./imagesMiddlewares";
import type CustomError from "../../../CustomError/CustomError";

const request = {
  file,
} as Partial<CustomRequest> as CustomRequest;
const response = mockResponse as Response;
const next = mockNext;

const mockResize = jest.fn().mockReturnThis();
const mockToFormat = jest.fn().mockReturnThis();

jest.mock("sharp", () => () => ({
  resize: mockResize,
  toFormat: mockToFormat,
  toFile: jest.fn(),
}));
const unlinkSpy = jest.spyOn(fs, "unlink");

describe("A format middleware", () => {
  it("Should format the image to webp, resize it (293 * 144) and call next", async () => {
    unlinkSpy.mockResolvedValue();

    await format(request, response, next);

    expect(mockResize).toHaveBeenCalledWith(293, 144);
    expect(mockToFormat).toHaveBeenCalledWith("webp");
    expect(request.file.convertedName).toBe("exampleImage.webp");
    expect(next).toHaveBeenCalled();
  });

  it("Should call next with format error it can't unlink the previous image", async () => {
    unlinkSpy.mockImplementation(() => {
      throw new Error("Failed to unlink the specified file");
    });

    await format(request, response, next);
    const { message, publicMessage } = next.mock.calls[1][0] as CustomError;

    expect(message).toBe("Failed to unlink the specified file");
    expect(publicMessage).toBe("Couldn't format the image");
  });
});
