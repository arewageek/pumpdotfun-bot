import mongoose, { Schema, type Document } from "mongoose";

interface IToken extends Document {
  ca: string;
  user: number;
}

const TokenSchema = new Schema(
  {
    ca: { type: String, required: true },
    user: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

const Token =
  mongoose.models.Token || mongoose.model<IToken>("Token", TokenSchema);

export default Token;
