import bcrypt from "bcryptjs";
import crypto from "crypto";
import mock from "mock-fs";
import jwt from "jsonwebtoken";
import request from "supertest";
import mockFlashcards from "../../../mocks/flashcards.mock";
import app from "../../app";
import {
  mockResize,
  mockToFormat,
  readfileSpy,
  unlinkSpy,
} from "../../../mocks/modulesUtils.mocks";
import bucket from "../../middlewares/images/supabase";
import { type FlashcardModel } from "../../../database/types";
import { Types } from "mongoose";
import User from "../../../database/models/User";
import Flashcard from "../../../database/models/Flashcards";

const userId = "6409d298f5c4e943969fc57f";
beforeAll(async () => {
  const user = new User({
    username: "AwesomeMagician",
    password: await bcrypt.hash("usuario1", 10),
  });
  user._id = new Types.ObjectId(userId);
  await user.save();
});

beforeEach(() => {
  mock(
    {
      "path/to/image.png": Buffer.from([0xff, 0xd8, 0xff]),
      "path/to/goodbye.png": Buffer.from([0xff, 0xd8, 0xff]),
      uploads: {},
    },
    {}
  );
});

afterEach(() => {
  mock.restore();
});

jest.mock("sharp", () => () => ({
  resize: mockResize,
  toFormat: mockToFormat,
  toFile: jest.fn(),
}));

const authorizationHeader = "Bearer RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo";

readfileSpy.mockResolvedValue("");
unlinkSpy.mockResolvedValue();
jwt.verify = jest.fn().mockReturnValue({
  id: userId,
});
crypto.randomUUID = jest.fn().mockReturnValue("12345678");

bucket.upload = jest.fn().mockResolvedValue(true);
bucket.getPublicUrl = jest.fn().mockImplementation((filename: string) => ({
  data: {
    publicUrl: `http://supabaseExample.co/${filename}`,
  },
}));

describe("Given POST /flashcards endpoint", () => {
  const { front, back, language, efactor, repetition } = mockFlashcards[0];
  const create = "/flashcards";

  describe("When it receives a request with a flashcard and authorization 'Bearer RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo'", () => {
    test("Then it should respond with the flashcard, interval 0, efactor 2.5, repetition 0", async () => {
      const response = await request(app)
        .post(create)
        .set("Content-Type", "multipart/form-data")
        .set("Authorization", authorizationHeader)
        .field("front", front)
        .field("back", back)
        .field("language", language)
        .attach("image", "path/to/image.png", { contentType: "image/png" })
        .expect(201);

      expect(response.body).toHaveProperty(
        "flashcard",
        expect.objectContaining({
          front,
          back,
          language,
          imageInfo: {
            fileName: `image12345678.webp`,
            imageBackup: "http://supabaseExample.co/image12345678.webp",
          },
          interval: 0,
          efactor,
          repetition,
        } as FlashcardModel)
      );
    });
  });

  const authPublicMessage = "Invalid token";

  describe("When it receives a request without authorization header", () => {
    test("Then it should respond with status 403 and message 'Invalid token'", async () => {
      const response = await request(app).post(create).expect(403);

      expect(response.body).toStrictEqual({
        message: authPublicMessage,
      });
    });
  });

  describe("When it receives a request with authorization header 'RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo'", () => {
    test("Then it should respond with status 403 and message 'Invalid token'", async () => {
      const response = await request(app)
        .post(create)
        .set("Authorization", "RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo")
        .expect(403);

      expect(response.body).toStrictEqual({
        message: authPublicMessage,
      });
    });
  });
});

describe("Given a PATCH '/flashcards/:flashcardId' endpoint", () => {
  const modify = `/flashcards/${mockFlashcards[2].id!}`;

  beforeEach(async () => {
    const { id, ...clone } = mockFlashcards[2];
    const flashcard = new Flashcard({
      ...clone,
      dueDate: "2023-04-01T21:17:42+0000",
    });
    flashcard._id = new Types.ObjectId(id);
    await flashcard.save();
  });

  afterEach(async () => {
    await Flashcard.findByIdAndDelete(mockFlashcards[2].id).exec();
  });

  describe("When it receives a request with flashcardId '6422f13254bee8bb0b6151ba' and the same flashcard info (front and back)", () => {
    test("Then it should respond with status 200, the updated flashcard without modifying efactor, repetition and interval", async () => {
      const { front, back, language } = mockFlashcards[2];
      bucket.remove = jest.fn().mockResolvedValue("");

      const response = await request(app)
        .patch(modify)
        .set("Content-Type", "multipart/form-data")
        .set("Authorization", authorizationHeader)
        .field("front", front)
        .field("back", back)
        .field("language", language)
        .attach("image", "path/to/image.png", { contentType: "image/png" })
        .expect(200);

      expect(response.body).toStrictEqual({
        flashcard: expect.objectContaining({
          ...mockFlashcards[2],
          dueDate: "2023-04-01T21:17:42+0000",
        }) as FlashcardModel,
      });
    });
  });

  describe("When it receives a request with flashcardId '6422f13254bee8bb0b6151ba' and different flashcard info (front and back)", () => {
    test("Then it should respond with status 200, the updated flashcard reseting efactor, repetition and interval to initial values", async () => {
      const { front, back, language } = mockFlashcards[1];

      const response = await request(app)
        .patch(modify)
        .set("Content-Type", "multipart/form-data")
        .set("Authorization", authorizationHeader)
        .field("front", front)
        .field("back", back)
        .field("language", language)
        .attach("image", "path/to/goodbye.png", { contentType: "image/png" })
        .expect(200);

      expect(response.body).toStrictEqual({
        flashcard: expect.objectContaining({
          id: "6422f13254bee8bb0b6151ba",
          efactor: 2.5,
          repetition: 0,
          interval: 0,
        }) as FlashcardModel,
      });
    });
  });
});

describe("Given a PATCH '/flashcards/practice/:flashcardId' endpoint", () => {
  beforeAll(async () => {
    const { id, ...clone } = mockFlashcards[1];
    const flashcard = new Flashcard({
      ...clone,
      dueDate: "2023-04-01T21:17:42+0000",
    });
    flashcard._id = new Types.ObjectId(id);
    await flashcard.save();
  });
  const practice = `/flashcards/practice/${mockFlashcards[1].id!}`;

  describe("When it receives a request with id  grade 5", () => {
    test("Then it should respond with status 200, the flashcard and update interval 1, repetition 1, efactor 2.6", async () => {
      mock.restore();

      const response = await request(app)
        .patch(practice)
        .set("Authorization", authorizationHeader)
        .send({ grade: 5 })
        .expect(200);

      expect(response.body).toStrictEqual({
        flashcard: expect.objectContaining({
          ...mockFlashcards[1],
          efactor: 2.6,
          interval: 1,
          repetition: 1,
        }) as FlashcardModel,
      });
    });
  });

  describe("When it receives a request with id '6422f129bbb45f90d5283166' and grade 6", () => {
    test("Then it should respond with status 400 and 'Validation has failed' message", async () => {
      const response = await request(app)
        .patch(practice)
        .set("Authorization", authorizationHeader)
        .send({ grade: 6 })
        .expect(400);

      expect(response.body).toStrictEqual({
        message: "Validation has failed",
      });
    });
  });
});
