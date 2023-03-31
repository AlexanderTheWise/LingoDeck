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

const userId = "6409d298f5c4e943969fc57f";
beforeAll(async () => {
  (
    await User.create({
      username: "AwesomeMagician",
      password: await bcrypt.hash("usuario1", 10),
    })
  )._id = new Types.ObjectId(userId);

  mock(
    {
      "path/to/image.png": Buffer.from([0xff, 0xd8, 0xff]),
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

describe("Given POST /flashcards endpoint", () => {
  const { front, back, language, efactor, repetition } = mockFlashcards[0];
  const create = "/flashcards";

  describe("When it receives a request with a flashcard and authorization 'Bearer RISERO?rYsLDYo-6?3RMUSsizfbEqj0/?Q!cFZfo'", () => {
    test("Then it should respond with the flashcard, interval 0, efactor 2.5, repetition 0", async () => {
      bucket.upload = jest.fn().mockResolvedValue(true);
      bucket.getPublicUrl = jest.fn().mockReturnValue({
        data: {
          publicUrl: "http://supabaseExample.co/image12345678.webp",
        },
      });

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
