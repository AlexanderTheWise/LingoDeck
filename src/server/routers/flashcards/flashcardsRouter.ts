import crypto from "crypto";
import { Router } from "express";
import { validate } from "express-validation";
import multer, { diskStorage } from "multer";
import { parse } from "path";
import { createFlashcard } from "../../controllers/flashcards/flashcardsControllers.js";
import auth from "../../middlewares/auth/auth.js";
import { backup, format } from "../../middlewares/images/imagesMiddlewares.js";
import cardFields from "../../schemas/cardFields.js";
import { type CustomFile } from "../../types.js";

const storage = diskStorage({
  destination: "uploads",
  filename(req, file: CustomFile, callback) {
    const { name, ext } = parse(file.originalname);
    const suffix = crypto.randomUUID();
    const convertedName = `${name}${suffix}${ext}`;

    file.convertedName = convertedName;
    callback(null, convertedName);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    const { error } = cardFields.body.validate(req.body);
    callback(null, !error);
  },
  limits: {
    fileSize: 10000,
  },
});

const flashcardsRouter = Router();

flashcardsRouter.post(
  "",
  auth,
  upload.single("image"),
  validate(cardFields, {}, { abortEarly: false }),
  format,
  backup,
  createFlashcard
);

export default flashcardsRouter;
