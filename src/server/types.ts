import { type Request } from "express";

export interface UserCredentials {
  username: string;
  password: string;
}

export interface LoginUserPayload extends Pick<UserCredentials, "username"> {
  id: string;
}

export type TestRequest<T> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  T
>;
