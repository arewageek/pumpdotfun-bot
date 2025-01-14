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

      console.log({ user });
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
}

const users = new Users();

export default users;
