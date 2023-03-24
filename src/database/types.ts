import { type Types } from "mongoose";

export interface UserModel {
  username: string;
  password: string;
  flashcards: Types.ObjectId[];
}
