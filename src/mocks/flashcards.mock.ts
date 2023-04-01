import { type FlashcardModel } from "../database/types";

interface MockFlashcard extends Omit<FlashcardModel, "dueDate"> {
  id: string;
}

const mockFlashcards: MockFlashcard[] = [
  {
    id: "6422f11dded99925cb179372",
    front: "Hello",
    back: "Hola",
    imageInfo: {
      fileName: "hello.webp",
      imageBackup: "https://example.com/images/hello.wepb",
    },
    language: "English",
    efactor: 2.5,
    interval: 1,
    repetition: 0,
  },
  {
    id: "6422f129bbb45f90d5283166",
    front: "Goodbye",
    back: "Adiós",
    imageInfo: {
      fileName: "goodbye.webp",
      imageBackup: "https://example.com/images/goodbye.webp",
    },
    language: "English",
    efactor: 2.5,
    interval: 1,
    repetition: 0,
  },
  {
    id: "6422f13254bee8bb0b6151ba",
    front: "Cat",
    back: "Gato",
    imageInfo: {
      fileName: "cat.webp",
      imageBackup: "https://example.com/images/cat.webp",
    },
    language: "English",
    efactor: 2.5,
    interval: 1,
    repetition: 0,
  },
];

export default mockFlashcards;
