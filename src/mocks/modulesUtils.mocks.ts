import fs from "fs/promises";

export const mockResize = jest.fn().mockReturnThis();
export const mockToFormat = jest.fn().mockReturnThis();
export const unlinkSpy = jest.spyOn(fs, "unlink");
export const readfileSpy = jest.spyOn(fs, "readFile");
