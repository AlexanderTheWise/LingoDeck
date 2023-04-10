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
import {
  type UserDocument,
  type FlashcardModel,
} from "../../../database/types";
import { Types } from "mongoose";
import User from "../../../database/models/User";
import Flashcard from "../../../database/models/Flashcards";
import flashcards from "../../../flashcards.json";

const userId = "6409d298f5c4e943969fc57f";
let user: UserDocument;

beforeAll(async () => {
  user = new User({
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

const practicedFlashcard = {
  ...mockFlashcards[1],
  efactor: 2.6,
  interval: 1,
  repetition: 1,
};

const message = "Validation has failed";

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
          ...practicedFlashcard,
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
        message,
      });
    });
  });
});

describe("Given a GET '/flashcards/:flashcardId' endpoint", () => {
  describe("When it receives a request with id '6422f11dded99925cb179372'", () => {
    const get = `/flashcards/${practicedFlashcard.id!}`;

    test("Then it should respond with a flashcard", async () => {
      const response = await request(app)
        .get(get)
        .set("Authorization", authorizationHeader)
        .expect(200);

      expect(response.body).toStrictEqual({
        flashcard: {
          ...mockFlashcards[1],
          dueDate: "2023-04-01T21:17:42+0000",
        },
      });
    });
  });

  describe("When it receives a request with id '6429d58fa0c9ff3aa7cc95c3'", () => {
    const getFlashcard = "/flashcards/6429d58fa0c9ff3aa7cc95c3";

    test("Then it should respond with message 'The requested flashcard doesn't exist'", async () => {
      const response = await request(app)
        .get(getFlashcard)
        .set("Authorization", authorizationHeader)
        .expect(404);

      expect(response.body).toStrictEqual({
        message: "The requested flashcard doesn't exist",
      });
    });
  });
});

describe("Given a DELETE '/flashcards/:flashcardId' endpoint", () => {
  describe("When it receives a request with param flashcardId 6434324c6d9613e4f5c334ab", () => {
    test("Then it should respond with message 'Flashcard has been deleted succesfully'", async () => {
      const response = await request(app)
        .delete("/flashcards/6434324c6d9613e4f5c334ab")
        .set("Authorization", authorizationHeader)
        .expect(200);

      expect(response.body).toStrictEqual({
        message: "Flashcard has been deleted succesfully",
      });
    });
  });
});

describe("Given a GET '/flashcards' endpoint", () => {
  beforeAll(async () => {
    await Flashcard.deleteMany({}).exec();
    (flashcards as FlashcardModel[]).forEach(async (flashcard) => {
      const newFlashcard = new Flashcard(flashcard);
      user.flashcards.push(newFlashcard._id);

      await newFlashcard.save();
    });

    await user.save();
  });

  const getFlashcards = "/flashcards";

  describe("When it receives a request without query params", () => {
    test("Then it should respond with status 200 and the first five flashcards in the list and page null", async () => {
      const response = await request(app)
        .get(getFlashcards)
        .set("Authorization", authorizationHeader)
        .expect(200);

      flashcards.slice(0, 5).forEach((flashcard) => {
        expect(response.body).toStrictEqual({
          flashcards: expect.arrayContaining([
            expect.objectContaining(flashcard),
          ]) as FlashcardModel[],
          page: null,
        });
      });
    });
  });

  describe("When it receives a request with query params: limit 3, page 2, and language Spanish", () => {
    test("Then it should respond with status 200 and the next three Spanish flashcards that follow the first three and page 2.", async () => {
      const response = await request(app)
        .get(`${getFlashcards}?limit=3&page=2&language=Spanish`)
        .set("Authorization", authorizationHeader)
        .expect(200);

      flashcards.slice(3, 6).forEach((flashcard) => {
        expect(response.body).toStrictEqual({
          flashcards: expect.arrayContaining([
            expect.objectContaining(flashcard),
          ]) as FlashcardModel[],
          page: 2,
        });
      });
    });
  });

  describe("When it receives a request with query params: limit 5, page 1, and language French", () => {
    test("Then it should respond with status 200 and the first five French flashcards and page 1", async () => {
      const response = await request(app)
        .get(`${getFlashcards}?limit=5&page=1&language=French`)
        .set("Authorization", authorizationHeader)
        .expect(200);

      flashcards.slice(10, 15).forEach((flashcard) => {
        expect(response.body).toStrictEqual({
          flashcards: expect.arrayContaining([
            expect.objectContaining(flashcard),
          ]) as FlashcardModel[],
          page: 1,
        });
      });
    });
  });

  describe("When it receives a request with query param limit 0", () => {
    test("Then it should respond with status 400 and message 'Validation has failed'", async () => {
      const response = await request(app)
        .get(`${getFlashcards}?limit=0`)
        .set("Authorization", authorizationHeader)
        .expect(400);

      expect(response.body).toStrictEqual({
        message,
      });
    });
  });

  describe("When it receives a request with query param page 0", () => {
    test("Then it should respond with status 400 and message 'Validation has failed'", async () => {
      const response = await request(app)
        .get(`${getFlashcards}?page=0`)
        .set("Authorization", authorizationHeader)
        .expect(400);

      expect(response.body).toStrictEqual({
        message,
      });
    });
  });

  describe("When it receives a request with query param language spanish", () => {
    test("Then it should respond with status 400 and message 'Validation has failed'", async () => {
      const response = await request(app)
        .get(`${getFlashcards}?language=spanish`)
        .set("Authorization", authorizationHeader)
        .expect(400);

      expect(response.body).toStrictEqual({
        message,
      });
    });
  });
});
