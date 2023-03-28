import mongoose from "mongoose";
import { type FlashcardModel } from "../types";

const flashcardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  imageInfo: {
    type: Object,
    required: true,
  },
  interval: {
    type: Number,
    required: true,
  },
  repetition: {
    type: Number,
    required: true,
  },
  efactor: {
    type: Number,
    required: true,
  },
});

const Flashcard = mongoose.model<FlashcardModel>(
  "Flashcard",
  flashcardSchema,
  "flashcards"
);

export default Flashcard;
