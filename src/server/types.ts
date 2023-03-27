import { type Request } from "express";

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
export interface CustomRequest extends Request {
  userId: string;
  file: CustomFile;
}
