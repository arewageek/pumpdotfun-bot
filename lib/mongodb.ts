import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL!);
    console.log("Connected to database");
  } catch (e) {
    console.log("Error connecting to database", e);
    process.exit(1);
  }
};
