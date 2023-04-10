import crypto from "crypto";
import { Router } from "express";
import { validate } from "express-validation";
import multer, { diskStorage } from "multer";
import { parse } from "path";
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcard,
  getFlashcards,
  modifyFlashcard,
  practiceFlashcard,
} from "../../controllers/flashcards/flashcardsControllers.js";
import auth from "../../middlewares/auth/auth.js";
import {
  backup,
  deleteImage,
  format,
} from "../../middlewares/images/imagesMiddlewares.js";
import cardFields from "../../schemas/cardFields.js";
import { type CustomFile } from "../../types.js";
import grade from "../../schemas/grade.js";
import queries from "../../schemas/queries.js";

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
    fileSize: 5e6,
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

flashcardsRouter.patch(
  "/:flashcardId",
  auth,
  upload.single("image"),
  validate(cardFields, {}, { abortEarly: false }),
  format,
  backup,
  deleteImage,
  modifyFlashcard
);

flashcardsRouter.patch(
  "/practice/:flashcardId",
  auth,
  validate(grade, {}, { abortEarly: false }),
  practiceFlashcard
);

flashcardsRouter.get("/:flashcardId", auth, getFlashcard);
flashcardsRouter.get(
  "",
  auth,
  validate(queries, {}, { abortEarly: false }),
  getFlashcards
);
flashcardsRouter.delete("/:flashcardId", auth, deleteFlashcard);

export default flashcardsRouter;
