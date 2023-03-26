import bcrypt from "bcryptjs";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import connectDatabase from "../../../database/connectDatabase.js";
import User from "../../../database/models/User.js";
import { type ResponseMessage, type UserCredentials } from "../../types.js";
import app from "../../app.js";

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  await connectDatabase(server.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
});

describe("Given a POST '/user/login' endpoint", () => {
  const login = "/user/login";
  const user: UserCredentials = {
    username: "TechNerd",
    password: "usuario1",
  };
  const correctUser = { ...user };

  beforeAll(async () => {
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 10),
    });
  });

  describe("When it receives a request with username 'TechNerd' and password 'usuario1'", () => {
    test("Then it should respond with a token", async () => {
      const response = await request(app)
        .post(login)
        .send(correctUser)
        .expect(201);

      expect(response.body).toStrictEqual({
        token: expect.any(String) as string,
      });
    });
  });

  const wrongCredentials: ResponseMessage = {
    message: "Wrong credentials",
  };

  describe("When it receives a request with username 'ArtEnthusiast' and password 'usuario1'", () => {
    test("Then it should respond with 'Wrong credentials' message", async () => {
      user.username = "ArtEnthusiast";
      const response = await request(app).post(login).send(user).expect(401);

      expect(response.body).toStrictEqual(wrongCredentials);
    });
  });

  describe("When it receives a request with username 'TechNerd' and password 'fakeUsuario1'", () => {
    test("Then it should respond with 'Wrong credentials' message", async () => {
      user.username = correctUser.username;
      user.password = "fakeUsuario1";

      const response = await request(app).post(login).send(user).expect(401);

      expect(response.body).toStrictEqual(wrongCredentials);
    });
  });

  const validationHasFailed: ResponseMessage = {
    message: "Validation has failed",
  };

  describe("When it receives a request with username '$pecial_username'", () => {
    test("Then it should respond with 'Validation has failed' message", async () => {
      user.username = "$pecial_username";

      const response = await request(app).post(login).send(user).expect(400);

      expect(response.body).toStrictEqual(validationHasFailed);
    });
  });

  describe("When it receives a request with password 'passw'", () => {
    test("Then it should respond with 'Validation has failed' message", async () => {
      user.username = correctUser.username;
      user.password = "passw";

      const response = await request(app).post(login).send(user).expect(400);

      expect(response.body).toStrictEqual(validationHasFailed);
    });
  });
});
