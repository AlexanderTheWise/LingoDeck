import { type Response, type NextFunction } from "express";
import sharp from "sharp";
import { join, parse } from "path";
import { unlink, readFile } from "fs/promises";
import { type CustomRequest } from "../../types.js";
import CustomError from "../../../CustomError/CustomError.js";
import bucket from "./supabase.js";
import Flashcard from "../../../database/models/Flashcards.js";

export const format = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { convertedName, destination } = request.file;
    const { name } = parse(convertedName);
    const path = join(destination, convertedName);

    await sharp(path)
      .resize(293, 144)
      .toFormat("webp")
      .toFile(join(destination, `${name}.webp`));

    await unlink(path);

    request.file.convertedName = `${name}.webp`;

    next();
  } catch (error) {
    const formatError = new CustomError(
      (error as Error).message,
      0,
      "Couldn't format the image"
    );

    next(formatError);
  }
};

export const backup = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const { destination, convertedName } = request.file;
    const imageBuffer = await readFile(join(destination, convertedName));
    await bucket.upload(convertedName, imageBuffer);

    const {
      data: { publicUrl },
    } = bucket.getPublicUrl(convertedName);

    request.file.backupUrl = publicUrl;
    next();
  } catch (error) {
    const backupError = new CustomError(
      (error as Error).message,
      0,
      "Couldn't create an image backup"
    );

    next(backupError);
  }
};

export const deleteImage = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { flashcardId },
      file: { destination },
    } = request;
    const flashcard = await Flashcard.findById(flashcardId).exec();
    const filename = flashcard!.imageInfo.fileName;

    await unlink(join(destination, filename));
    await bucket.remove([filename]);

    next();
  } catch (error) {
    const deleteImageError = new CustomError(
      (error as Error).message,
      0,
      "Couldn't delete the current image"
    );

    next(deleteImageError);
  }
};
