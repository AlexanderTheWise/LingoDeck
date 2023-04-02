import { supermemo } from "supermemo";
import dayjs from "dayjs";
import { type NextFunction, type Response } from "express";
import CustomError from "../../../CustomError/CustomError.js";
import Flashcard from "../../../database/models/Flashcards.js";
import User from "../../../database/models/User.js";
import { type CustomRequest } from "../../types.js";
import { type FlashcardModel } from "../../../database/types.js";

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
      dueDate: dayjs().toISOString(),
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

export const modifyFlashcard = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { flashcardId },
      file: { convertedName: fileName, backupUrl: imageBackup },
      body,
    } = request;
    const flashcard = await Flashcard.findById(flashcardId).exec();
    const needReset = !(
      flashcard!.front === body.front && flashcard!.back === body.back
    );

    flashcard?.$set({
      ...body,
      imageInfo: {
        fileName,
        imageBackup,
      },
      efactor: needReset ? 2.5 : flashcard.efactor,
      interval: needReset ? 0 : flashcard.interval,
      repetition: needReset ? 0 : flashcard.repetition,
      dueDate: needReset ? dayjs() : flashcard.dueDate,
    } as FlashcardModel);

    await flashcard!.save();

    response.status(200).json({ flashcard });
  } catch (error) {
    const modifyError = new CustomError(
      (error as Error).message,
      0,
      "Couldn't modify the flashcard"
    );

    next(modifyError);
  }
};

export const practiceFlashcard = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { flashcardId },
      body: { grade },
    } = request;

    if (!(grade > -1 && grade < 6)) {
      throw new Error("Invalid grade");
    }

    const flashcard = await Flashcard.findById(flashcardId).exec();
    const supermemoItem = supermemo(
      {
        efactor: flashcard!.efactor,
        interval: flashcard!.interval,
        repetition: flashcard!.repetition,
      },
      grade
    );

    flashcard?.$set({
      ...supermemoItem,
      dueDate: dayjs().add(supermemoItem.interval, "days").toISOString(),
    });

    response.status(200).json({ flashcard });
  } catch (error) {
    const practiceError = new CustomError(
      (error as Error).message,
      0,
      "Couldn't set the next due date"
    );

    next(practiceError);
  }
};

export const getFlashcard = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { flashcardId },
    } = request;

    const flashcard = await Flashcard.findById(flashcardId).exec();
    if (!flashcard) {
      throw new Error("Couldn't find the requested flashcard");
    }

    response.status(200).json({ flashcard });
  } catch (error) {
    const getFlashcardError = new CustomError(
      (error as Error).message,
      404,
      "The requested flashcard doesn't exist"
    );

    next(getFlashcardError);
  }
};
