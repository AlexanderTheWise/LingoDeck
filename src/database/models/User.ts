import mongoose from "mongoose";
import { type UserModel } from "../types";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  flashcards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" }],
});

const User = mongoose.model<UserModel>("User", userSchema, "users");

export default User;
