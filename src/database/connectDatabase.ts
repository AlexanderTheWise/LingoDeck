import "../loadEnvironment.js";
import createDebug from "debug";
import mongoose from "mongoose";

const debug = createDebug("lingodeck:connectDatabase");

const connectDatabase = async (uri: string) => {
  mongoose.set("strictQuery", false);
  mongoose.set("debug", true);
  mongoose.set("toJSON", {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
  });

  try {
    await mongoose.connect(uri);
    debug("Connected to the database");
  } catch (error) {
    debug(
      `Error while connecting to the database. ${(error as Error).message}`
    );
  }
};

export default connectDatabase;
