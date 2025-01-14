import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  chatId: number;
  username: string;
  balance: number;
  stats: {
    volume: number;
    count: number;
  };
}

const UserSchema = new Schema(
  {
    chatId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0 },
    stats: {
      volume: Number,
      count: Number,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
