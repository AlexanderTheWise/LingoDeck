import fs from "fs/promises";
import { type Response } from "express";
import { mockNext, mockResponse, file } from "../../../mocks/express.mock";
import { type CustomRequest } from "../../types";
import { backup, format } from "./imagesMiddlewares";
import type CustomError from "../../../CustomError/CustomError";
import bucket from "./supabase";

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
const readfileSpy = jest.spyOn(fs, "readFile");

afterEach(() => {
  next.mockClear();
});

describe("A format middleware", () => {
  it("Should format the image to webp, resize it (293 * 144) and call next", async () => {
    unlinkSpy.mockResolvedValue();

    await format(request, response, next);

    expect(mockResize).toHaveBeenCalledWith(293, 144);
    expect(mockToFormat).toHaveBeenCalledWith("webp");
    expect(request.file.convertedName).toBe("exampleImage.webp");
    expect(next).toHaveBeenCalled();
  });

  it("Should call next with format error if can't unlink the previous image", async () => {
    unlinkSpy.mockImplementation(() => {
      throw new Error("Failed to unlink the specified file");
    });

    await format(request, response, next);
    const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

    expect(message).toBe("Failed to unlink the specified file");
    expect(publicMessage).toBe("Couldn't format the image");
  });
});

describe("A backup middleware", () => {
  bucket.upload = jest.fn().mockResolvedValue(true);
  bucket.getPublicUrl = jest.fn().mockReturnValue({
    data: {
      publicUrl: "http://supabaseExample.co/exampleImage.webp",
    },
  });

  it("Should get the public url of the recent uploaded image, assign it to backupUrl and call next", async () => {
    readfileSpy.mockResolvedValue("");
    await backup(request, response, next);

    expect(request.file.backupUrl).toBe(
      "http://supabaseExample.co/exampleImage.webp"
    );
    expect(next).toHaveBeenCalled();
  });

  const commonPublicMessage = "Couldn't create an image backup";

  it("Should call next with backupError for lack of access to the bucket", async () => {
    bucket.upload = jest.fn().mockImplementation(() => {
      throw new Error(
        "AccessDenied: Access to the specified resource has been denied"
      );
    });

    await backup(request, response, next);
    const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

    expect(message).toBe(
      "AccessDenied: Access to the specified resource has been denied"
    );
    expect(publicMessage).toBe(commonPublicMessage);
  });

  it("Should call next with backupError if it can't read the file", async () => {
    readfileSpy.mockImplementation(() => {
      throw new Error("Can't read the specified file");
    });

    await backup(request, response, next);
    const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

    expect(message).toBe("Can't read the specified file");
    expect(publicMessage).toBe(commonPublicMessage);
  });
});
