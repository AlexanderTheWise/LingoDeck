import { type Types } from "mongoose";
import { type SuperMemoItem } from "supermemo";
export interface UserModel {
  username: string;
  password: string;
  flashcards: Types.ObjectId[];
}

export interface FlashcardModel extends SuperMemoItem {
  front: string;
  back: string;
  imageInfo: {
    fileName: string;
    imageBackup: string;
  };
  language: string;
  dueDate: string;
}
