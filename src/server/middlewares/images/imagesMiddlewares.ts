import { type Response, type NextFunction } from "express";
import sharp from "sharp";
import { join, parse } from "path";
import { unlink } from "fs/promises";
import { type CustomRequest } from "../../types";
import CustomError from "../../../CustomError/CustomError";

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
