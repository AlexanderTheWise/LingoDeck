import { type Response } from "express";

export const mockResponse: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

export const mockNext = jest.fn();
