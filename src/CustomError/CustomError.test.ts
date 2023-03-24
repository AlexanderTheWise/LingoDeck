import CustomError from "./CustomError";

describe("Given a CustomError class", () => {
  describe("When it receives a message 'Endpoint not found', statusCode 404 and publicMessage 'Couldn't find the resource you were searching'", () => {
    test("Then it should create an object with those properties pointing to that values", () => {
      const message = "Endpoint not found";
      const statusCode = 404;
      const publicMessage = "Couldn't find the resource you were searching";

      const notFoundError = new CustomError(
        "Endpoint not found",
        404,
        "Couldn't find the resource you were searching"
      );

      expect(notFoundError).toHaveProperty("message", message);
      expect(notFoundError).toHaveProperty("statusCode", statusCode);
      expect(notFoundError).toHaveProperty("publicMessage", publicMessage);
    });
  });
});
