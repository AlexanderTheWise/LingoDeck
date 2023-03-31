import bcrypt from "bcryptjs";
import request from "supertest";
import User from "../../../database/models/User.js";
import { type ResponseMessage, type UserCredentials } from "../../types.js";
import app from "../../app.js";
import { Types } from "mongoose";

const user: UserCredentials = {
  username: "TechNerd",
  password: "usuario1",
};
const correctUser = { ...user };
const userId = "6409d298f5c4e943969fc56f";

beforeAll(async () => {
  (
    await User.create({
      username: "TechNerd",
      password: await bcrypt.hash("usuario1", 10),
    })
  )._id = new Types.ObjectId(userId);
});

describe("Given a POST '/user/login' endpoint", () => {
  const login = "/user/login";

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

describe("Given a POST '/user/register' endpoint", () => {
  const register = "/user/register";

  describe("When it receives a request with username 'ArtEnthusiast' and password 'usuario2'", () => {
    test("Then it should respond with message 'User ArtEnthusiast has been succesfully created'", async () => {
      user.username = "ArtEnthusiast";
      user.password = "usuario2";

      const response = await request(app).post(register).send(user).expect(201);

      expect(response.body).toStrictEqual({
        message: "User ArtEnthusiast has been succesfully created",
      });
    });
  });

  describe("When it receives a request with username 'Technerd' and password 'usuario1'", () => {
    test("Then it should respond with message 'Couldn't create the user'", async () => {
      const response = await request(app)
        .post(register)
        .send(correctUser)
        .expect(500);

      expect(response.body).toStrictEqual({
        message: "Couldn't create the user",
      });
    });
  });
});
