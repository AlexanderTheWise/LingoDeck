import { type Request, type request } from "express";
import { type SuperMemoGrade } from "supermemo";
import { type FlashcardModel } from "../database/types";

type ParsedQs = typeof request.query;
export interface UserCredentials {
  username: string;
  password: string;
}

export interface LoginUserPayload extends Pick<UserCredentials, "username"> {
  id: string;
}

export interface ResponseMessage {
  message: string;
}

export type TestRequest<T> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  T
>;
export interface CustomFile extends Express.Multer.File {
  convertedName: string;
  backupUrl: string;
}

export interface RequestFlashcard
  extends Pick<FlashcardModel, "back" | "front" | "language"> {
  grade: SuperMemoGrade;
}

export interface QueryStrings extends ParsedQs {
  limit: string;
  page: string;
  language: string;
}
export interface CustomRequest extends Request {
  userId: string;
  file: CustomFile;
  body: RequestFlashcard;
  params: {
    flashcardId: string;
  };
  query: QueryStrings;
}
