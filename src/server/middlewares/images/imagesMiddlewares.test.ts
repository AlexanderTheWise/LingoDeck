import { type Response } from "express";
import { mockNext, mockResponse, file } from "../../../mocks/express.mock";
import { type CustomRequest } from "../../types";
import { backup, deleteImage, format } from "./imagesMiddlewares";
import type CustomError from "../../../CustomError/CustomError";
import bucket from "./supabase";
import {
  mockResize,
  mockToFormat,
  readfileSpy,
  unlinkSpy,
} from "../../../mocks/modulesUtils.mocks";
import Flashcard from "../../../database/models/Flashcards";
import { type FlashcardModel } from "../../../database/types";

const request = {
  params: { flashcardId: "642755f5a32da7a5c508acbc" },
  file,
} as Partial<CustomRequest> as CustomRequest;
const response = mockResponse as Response;
const next = mockNext;

jest.mock("sharp", () => () => ({
  resize: mockResize,
  toFormat: mockToFormat,
  toFile: jest.fn(),
}));

afterEach(() => {
  next.mockClear();
  unlinkSpy.mockClear();
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

describe("Given a deleteImage middleware", () => {
  describe("When it receives a request with param 642755f5a32da7a5c508acbc and file destination 'uploads'", () => {
    test("Then it should call bucket.remove with ['exampleImage.webp'], unlink with 'uploads/exampleImage.webp' and next", async () => {
      Flashcard.findById = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({
          imageInfo: { fileName: "exampleImage.webp" },
        } as Pick<FlashcardModel, "imageInfo">),
      }));
      unlinkSpy.mockResolvedValue();
      bucket.remove = jest.fn().mockResolvedValue(true);

      await deleteImage(request, response, next);
      const fixedPath = (unlinkSpy.mock.calls[0][0] as string).replace(
        /\\/g,
        "/"
      );

      expect(bucket.remove).toHaveBeenCalledWith(["exampleImage.webp"]);
      expect(fixedPath).toBe("uploads/exampleImage.webp");
      expect(next).toHaveBeenCalled();
    });
  });

  const commonPublicMessage = "Couldn't delete the current image";

  describe("When it can't remove the file from the bucket due to invalid filename", () => {
    test("Then it should call next delete image error", async () => {
      bucket.remove = jest.fn().mockImplementation(() => {
        throw new Error(
          "Invalid file path. The file path provided is not valid or contains invalid characters."
        );
      });

      await deleteImage(request, response, next);
      const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

      expect(message).toBe(
        "Invalid file path. The file path provided is not valid or contains invalid characters."
      );
      expect(publicMessage).toBe(commonPublicMessage);
    });
  });
});
