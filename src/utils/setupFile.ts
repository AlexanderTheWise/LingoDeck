import mongoose, { Types } from "mongoose";
import connectDatabase from "../database/connectDatabase";

beforeAll(async () => {
  await connectDatabase(process.env.MONGO_URI!);
});

afterAll(async () => {
  await mongoose.connection.close();
});
