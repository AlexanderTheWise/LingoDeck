import { type Response } from "express";
import { Error } from "mongoose";
import { mockNext, mockResponse } from "../../../mocks/express.mock";
import { type CustomRequest } from "../../types";
import Flashcard from "../../../database/models/Flashcards";
import User from "../../../database/models/User";
import mockFlashcards from "../../../mocks/flashcards.mock";
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcard,
  getFlashcards,
  modifyFlashcard,
  practiceFlashcard,
} from "./flashcardsControllers";
import type CustomError from "../../../CustomError/CustomError";
import { type FlashcardModel } from "../../../database/types";
import { type SuperMemoGrade } from "supermemo";
import { isJSDocSeeTag } from "typescript";

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
  params: {},
} as Partial<CustomRequest> as CustomRequest;
const response = mockResponse as Response;
const next = mockNext;

const currentFlashcard: FlashcardModel = {
  ...mockFlashcards[0],
  dueDate: "2023-04-01T10:39:18+0000",
};

afterEach(() => {
  next.mockClear();
  (response.json as jest.Mock).mockClear();
});

describe("Given a createFlashcard controller", () => {
  User.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(true),
  }));

  describe("When it receives a flashcard", () => {
    request.body = {
      front,
      back,
      language,
      grade: 0,
    };
    test("Then it should respond with the flashcard, interval 0, repetition 0 and efactor 2.5", async () => {
      Flashcard.create = jest.fn().mockResolvedValue(currentFlashcard);

      await createFlashcard(request, response, next);

      expect(response.status).toHaveBeenLastCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        flashcard: currentFlashcard,
      });
    });
  });

  describe("When it receives a flashcard just with the front field", () => {
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

const findByIdMock = (
  flashcard: FlashcardModel,
  method: "mockResolvedValue" | "mockRejectedValue",
  methodValue: string | Error
) =>
  jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue({
      ...flashcard,
      $set: jest.fn().mockImplementation(function (flashcard: FlashcardModel) {
        Object.assign(this, flashcard);
      }),
      save: jest.fn()[method](methodValue),
    }),
  }));

describe("Given a modifyFlashcard controller", () => {
  const flashcard: FlashcardModel = {
    ...currentFlashcard,
    interval: 4,
    efactor: 3,
    repetition: 2,
  };

  describe("When it receives a request with param '6422f11dded99925cb179372' and equal front and back info", () => {
    test("Then it should respond with the updated flashcard info and the same spaced repetition info", async () => {
      Flashcard.findById = findByIdMock(flashcard, "mockResolvedValue", "");

      await modifyFlashcard(request, response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        flashcard: expect.objectContaining({
          ...flashcard,
        }) as FlashcardModel,
      });
    });
  });

  describe("When it receives a request with param '6422f11dded99925cb179372' and different front and back info", () => {
    test("Then it should respond with the updated flashcard info and reset spaced repetion info", async () => {
      request.params.flashcardId = "6422f11dded99925cb179372";
      request.body = {
        front: "Welcome",
        back: "Bienvenido",
        language: "English",
        grade: 0,
      };

      Flashcard.findById = findByIdMock(flashcard, "mockResolvedValue", "");

      await modifyFlashcard(request, response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        flashcard: expect.objectContaining({
          ...request.body,
          efactor: 2.5,
          interval: 0,
          repetition: 0,
        }) as FlashcardModel,
      });
    });
  });

  describe("When it can't save the modified flashcard", () => {
    test("Then it should call next with modifyFlashcard error", async () => {
      Flashcard.findById = findByIdMock(
        flashcard,
        "mockRejectedValue",
        new Error("There was a problem saving the flashcard")
      );

      await modifyFlashcard(request, response, next);
      const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

      expect(message).toBe("There was a problem saving the flashcard");
      expect(publicMessage).toBe("Couldn't modify the flashcard");
    });
  });
});

describe("Given a practiceFlashcard controller", () => {
  const flashcard: FlashcardModel = {
    ...currentFlashcard,
  };

  describe("When it receives a request with grade 5", () => {
    test("Then it should respond with the flashcard, interval 1, repetition 1, efactor 2.6 and dueDate '2023-04-02T10:39:18.000Z'", async () => {
      jest.useFakeTimers().setSystemTime(new Date(flashcard.dueDate));
      request.body.grade = 5;
      Flashcard.findById = findByIdMock(flashcard, "mockResolvedValue", "");

      await practiceFlashcard(request, response, next);

      expect(response.json).toHaveBeenCalledWith({
        flashcard: expect.objectContaining({
          ...flashcard,
          efactor: 2.6,
          interval: 1,
          repetition: 1,
          dueDate: "2023-04-02T10:39:18.000Z",
        }) as FlashcardModel,
      });

      jest.useRealTimers();
    });
  });

  describe("When it receives a request with grade 6", () => {
    test("Then it should call next with practice error", async () => {
      request.body.grade = 6 as SuperMemoGrade;

      await practiceFlashcard(request, response, next);
      const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

      expect(message).toBe("Invalid grade");
      expect(publicMessage).toBe("Couldn't set the next due date");
    });
  });
});

describe("A getFlashcard controller", () => {
  it("Should return respond with status 200 and a flashcard", async () => {
    Flashcard.findById = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({
        ...mockFlashcards[0],
        dueDate: "2023-04-02T10:39:18.000Z",
      }),
    }));

    await getFlashcard(request, response, next);

    expect(response.status).toHaveBeenLastCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      flashcard: {
        ...mockFlashcards[0],
        dueDate: "2023-04-02T10:39:18.000Z",
      },
    });
  });

  it("Should call next with get flashcard error if it can't find the flashcard", async () => {
    Flashcard.findById = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    await getFlashcard(request, response, next);
    const { message, publicMessage, statusCode } = next.mock
      .calls[0][0] as CustomError;

    expect(message).toBe("Couldn't find the requested flashcard");
    expect(statusCode).toBe(404);
    expect(publicMessage).toBe("The requested flashcard doesn't exist");
  });
});

describe("A getFlashcards controller", () => {
  it("Should respond with status 200 and a list of flashcards and the page of the request", async () => {
    request.query = {
      language: "English",
      page: "1",
      limit: "5",
    };

    User.findById = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({
        flashcards: mockFlashcards,
      }),
    }));

    await getFlashcards(request, response, next);

    expect(response.status).toHaveBeenLastCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      flashcards: mockFlashcards,
      page: 1,
    });
  });

  it("Should call next with getFlashcardsError if cannot find the user", async () => {
    User.findById = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    const commonMessage = "Couldn't find the specified user";

    await getFlashcards(request, response, next);
    const { message, statusCode, publicMessage } = next.mock
      .calls[0][0] as CustomError;

    expect(message).toBe(commonMessage);
    expect(statusCode).toBe(404);
    expect(publicMessage).toBe(commonMessage);
  });
});

describe("A deleteFlashcard controller", () => {
  it("Should respond with status 200 and message 'Flashcard has been deleted succesfully'", async () => {
    Flashcard.findByIdAndDelete = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(""),
    }));
    User.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(""),
    }));

    await deleteFlashcard(request, response, next);

    expect(response.status).toHaveBeenLastCalledWith(200);
    expect(response.json).toHaveBeenLastCalledWith({
      message: "Flashcard has been deleted succesfully",
    });
  });

  it("Should call next with deleteFlashcard error if it can't update the User document", async () => {
    User.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
      exec: jest
        .fn()
        .mockRejectedValue(
          new Error("There was a problem updating the document")
        ),
    }));

    await deleteFlashcard(request, response, next);
    const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

    expect(message).toBe("There was a problem updating the document");
    expect(publicMessage).toBe("There was a problem deleting the flashcard");
  });
});
