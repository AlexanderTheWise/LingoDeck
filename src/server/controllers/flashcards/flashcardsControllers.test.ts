import { type Response } from "express";
import { mockNext, mockResponse } from "../../../mocks/express.mock";
import { type RequestFlashcard, type CustomRequest } from "../../types";
import Flashcard from "../../../database/models/Flashcards";
import User from "../../../database/models/User";
import mockFlashcards from "../../../mocks/flashcards.mock";
import { createFlashcard } from "./flashcardsControllers";
import type CustomError from "../../../CustomError/CustomError";

const {
  imageInfo: { fileName, imageBackup },
  front,
  back,
  language,
} = mockFlashcards[0];
const request = {
  userId: "",
  file: {
    convertedName: fileName,
    backupUrl: imageBackup,
  },
} as Partial<CustomRequest> as CustomRequest;
const response = mockResponse as Response;
const next = mockNext;

describe("Given a createFlashcard controller", () => {
  User.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(true),
  }));

  describe("When it receives a flashcard", () => {
    request.body = {
      front,
      back,
      language,
    };
    test("Then it should respond with the flashcard, interval 0, repetition 0 and efactor 2.5", async () => {
      Flashcard.create = jest.fn().mockResolvedValue(mockFlashcards[0]);

      await createFlashcard(request, response, next);

      expect(response.status).toHaveBeenLastCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        flashcard: mockFlashcards[0],
      });
    });
  });

  describe("When it receives a flashcard just with the front field", () => {
    request.body = { front } as RequestFlashcard;

    test("Then it should call next with create flashcard error", async () => {
      Flashcard.create = jest.fn().mockImplementation(() => {
        throw new Error(
          "Flashcard validation failed: missing back and language properties"
        );
      });

      await createFlashcard(request, response, next);
      const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

      expect(message).toBe(
        "Flashcard validation failed: missing back and language properties"
      );
      expect(publicMessage).toBe("There was a problem creating the flashcard");
    });
  });
});
