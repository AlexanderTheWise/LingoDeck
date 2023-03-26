import bcrypt from "bcryptjs";
import { type Response } from "express";
import User from "../../../database/models/User.js";
import { loginUser, registerUser } from "./usersControllers.js";
import { mockResponse, mockNext } from "../../../mocks/express.mock.js";
import { type TestRequest, type UserCredentials } from "../../types.js";
import type CustomError from "../../../CustomError/CustomError.js";

const request = {
  body: {
    username: "@exampleUsername",
    password: "@examplePassword",
  },
} as TestRequest<UserCredentials>;
const response = mockResponse as Response;
const next = mockNext;

afterEach(() => {
  jest.clearAllMocks();
});

describe("Given a loginUser controller", () => {
  const compareSpy = jest.spyOn(bcrypt, "compare");

  describe("When it finds a user with the given username and password", () => {
    User.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({
        _id: "6407a2accaa85b5217cc1f44",
        username: "@exampleUsername",
      }),
    }));

    test("Then it should respond with a token", async () => {
      compareSpy.mockImplementationOnce(() => true);

      await loginUser(request, response, next);

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        token: expect.any(String) as string,
      });
    });
  });

  const commonErrorMessage = "Wrong credentials";
  const commonErrorStatus = 401;

  describe("When it doesn't find an user with the given username", () => {
    test("Then it should call next with wrong credentials error", async () => {
      User.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await loginUser(request, response, next);
      const { message, publicMessage, statusCode } = next.mock
        .calls[0][0] as CustomError;

      expect(message).toBe("Couldn't find user with given name");
      expect(publicMessage).toBe(commonErrorMessage);
      expect(statusCode).toBe(commonErrorStatus);
    });
  });

  describe("When the given password doesn't correspond with the queried user's", () => {
    test("Then it should call next with wrong credentials error", async () => {
      User.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(true),
      }));
      compareSpy.mockImplementationOnce(() => false);

      await loginUser(request, response, next);
      const { message, publicMessage, statusCode } = next.mock
        .calls[0][0] as CustomError;

      expect(message).toBe("Password doesn't match indicated");
      expect(publicMessage).toBe(commonErrorMessage);
      expect(statusCode).toBe(commonErrorStatus);
    });
  });
});

describe("Given a registerUser controller", () => {
  describe("When the given username already exists in the database", () => {
    test("Then it should call next with register error", async () => {
      User.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(true),
      }));

      await registerUser(request, response, next);
      const { message, publicMessage } = next.mock.calls[0][0] as CustomError;

      expect(message).toBe("Username already exists");
      expect(publicMessage).toBe("Couldn't create the user");
    });
  });

  describe("When the given username doesn't exists in the database", () => {
    test("Then it should respond with status 201 and message 'User @exampleUsername has been succesfully created'", async () => {
      User.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      User.create = jest.fn().mockResolvedValue(request.body);

      await registerUser(request, response, next);

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        message: "User @exampleUsername has been succesfully created",
      });
    });
  });
});
