import type { Context } from "grammy";
import { connectMongoDB } from "../lib/mongodb";
import User, { type IUser } from "../models/User.model";

class Users {
  async authenticate(ctx: Context): Promise<{
    valid: Boolean;
    data?: IUser;
    message?: string;
    status: 200 | 201 | 400;
  }> {
    try {
      const chatId = ctx.chatId;

      connectMongoDB();
      const user = await User.findOne({ chatId });

      console.log({ userFromControllerStat: user });
      if (!user) {
        const { username } = ctx.chat!;

        const trader = new User({
          chatId,
          username,
          balance: 0,
          stats: { volume: 0, count: 0 },
        });

        trader.save();

        console.log({ trader });
        return { status: 201, data: trader, valid: true };
      }
      return { valid: true, data: user, status: 200 };
    } catch (error) {
      console.log({ error });
      return { valid: false, message: "Error verifying user", status: 400 };
    }
  }

  async find(chatId: number) {
    try {
      connectMongoDB();
      const user = await User.findOne({ chatId });
      return user;
    } catch (error) {
      return null;
    }
  }

  async fund({
    chatId,
    amount,
  }: {
    chatId: number;
    amount: number;
  }): Promise<{ success: boolean }> {
    try {
      connectMongoDB();
      const user = await User.findOne({ chatId });
      const balance = { prev: user.balance, new: user.balance };
      balance.new = balance.prev + amount;

      user.balance = balance.new;
      user.save();

      return { success: true };
    } catch (error) {
      console.log({ fundWalletError: error });
      return { success: false };
    }
  }

  async withdraw({
    amount,
    chatId,
  }: {
    amount: number;
    chatId: number;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.find(chatId);
      if (!user) return { success: false };

      if (user.balance < amount)
        return { success: false, message: "Insufficient funds in wallet" };

      const balance = { old: user.balance, new: user.balance };
      balance.new = balance.old - amount;
      user.balance = balance.new;
      user.save();
      return { success: true };
    } catch (error) {
      console.log({ error });
      return { success: false };
    }
  }
}

const users = new Users();

export default users;
