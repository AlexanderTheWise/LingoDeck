import { type FlashcardModel } from "../database/types";

interface MockFlashcard extends Omit<FlashcardModel, "dueDate"> {
  id?: string;
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
      fileName: "goodbye12345678.webp",
      imageBackup: "http://supabaseExample.co/goodbye12345678.webp",
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
      fileName: "image12345678.webp",
      imageBackup: "http://supabaseExample.co/image12345678.webp",
    },
    language: "English",
    efactor: 4,
    interval: 3,
    repetition: 0,
  },
];

export default mockFlashcards;
