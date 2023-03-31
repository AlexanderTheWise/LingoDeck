/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.ts"],
  resolver: "jest-ts-webcompat-resolver",
  globalSetup: "<rootDir>/src/utils/globalSetup.ts",
  globalTeardown: "<rootDir>/src/utils/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/src/utils/setupFile.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/server/startServer.ts",
    "!src/database/connectDatabase.ts",
    "!src/utils/*",
  ],
};
