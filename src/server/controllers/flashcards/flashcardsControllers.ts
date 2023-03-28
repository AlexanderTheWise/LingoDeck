import { type NextFunction, type Response } from "express";
import CustomError from "../../../CustomError/CustomError.js";
import Flashcard from "../../../database/models/Flashcards.js";
import User from "../../../database/models/User.js";
import { type CustomRequest } from "../../types.js";

export const createFlashcard = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const {
      userId,
      body,
      file: { convertedName: fileName, backupUrl: imageBackup },
    } = request;

    const flashcard = await Flashcard.create({
      ...body,
      imageInfo: {
        fileName,
        imageBackup,
      },
      efactor: 2.5,
      interval: 0,
      repetition: 0,
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { flashcards: flashcard._id },
    }).exec();

    response.status(201).json({
      flashcard,
    });
  } catch (error) {
    const createFlashcardError = new CustomError(
      (error as Error).message,
      0,
      "There was a problem creating the flashcard"
    );

    next(createFlashcardError);
  }
};
