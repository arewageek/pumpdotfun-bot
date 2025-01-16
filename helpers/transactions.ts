import { connectMongoDB } from "../lib/mongodb";
import Token from "../models/Token.model";
import Transaction from "../models/Transaction.model";
import User from "../models/User.model";

interface ITokenData {
  success: boolean;
  message?: string;
  meta?: { balance: number };
  data?: {
    address: string;
    symbol: string;
    name: string;
    logo: string;
    creator: string;
    twitter: string;
    website: string;
    telegram: string;
    marketCap: number;
    liquidity: number;
    price: number;
    priceSol: string;
    tradeUserCount: number;
    tradeVolume24h: number;
    bondingCurveProgress: number;
    top10Holder: number;
    buyCount24h: number;
    sellCount24h: number;
  };
}

interface IPosition {
  trader: number;
  marketCap: { buy: number; sell?: number };
  tokenQtty: number;
  usdValue: { buy: number; sell?: number };
  isOpen: boolean;
  token: { name: string; symbol: string; ca: string };
}

class Meme {
  baseUrl = "https://meme-api.openocean.finance";

  async data(ca: string, user?: number): Promise<ITokenData> {
    user && connectMongoDB();

    const url = `${this.baseUrl}/market/token/detail?address=${ca}`;
    try {
      const req = await fetch(url);

      if (!req.ok) throw new Error("Failed to get token data");

      const res = await req.json();
      console.log({ res });

      const {
        address,
        symbol,
        name,
        logo,
        creator,
        twitter,
        website,
        telegram,
        marketCap,
        liquidity,
        price,
        priceSol,
        tradeUserCount,
        tradeVolume24h,
        bondingCurveProgress,
        top10Holder,
        buyCount24h,
        sellCount24h,
      } = res.data;

      let balance = 0;

      if (user) {
        const account = await User.findOne({ chatId: user });
        balance = account.balance;

        await this.makeSession(ca, user);
      }

      return {
        success: true,
        meta: { balance },
        data: {
          address,
          symbol,
          name,
          logo,
          creator,
          twitter,
          website,
          telegram,
          marketCap,
          liquidity,
          price,
          priceSol,
          tradeUserCount,
          tradeVolume24h,
          bondingCurveProgress,
          top10Holder,
          buyCount24h,
          sellCount24h,
        },
      };
    } catch (error: any) {
      console.log({ error });
      return { success: false, message: error.message };
    }
  }

  async makeSession(ca: string, user: number): Promise<{ success: boolean }> {
    try {
      connectMongoDB();
      const tokenSession = await Token.findOne({ user });
      if (!tokenSession) {
        const createRecord = new Token({
          ca,
          user,
        });
        await createRecord.save();
      }

      tokenSession.ca = ca;
      await tokenSession.save();

      return { success: true };
    } catch (error) {
      console.log({ error });
      return { success: false };
    }
  }

  async buy(
    chatId: number,
    amount: number
  ): Promise<{
    success: boolean;
    message?: string;
    data?: { buy: { mc: number; price: number }; quantity: number };
  }> {
    try {
      connectMongoDB();

      const user = await User.findOne({ chatId });
      const balance = user.balance;

      if (balance < amount)
        return {
          success: false,
          message: "Balance too low for this transaction 🤭",
        };

      const token = await Token.findOne({ user: chatId });
      const ca = await token.ca;

      const tokenData = this.data(ca);
      const tokenPrice = (await tokenData).data?.price!;
      const tokenQtty = amount / tokenPrice;

      const { marketCap, price, symbol, name } = (await tokenData).data!;

      const record = await Transaction.findOne({
        trader: chatId,
        "token.ca": ca,
      });

      // const single_record = records[0];

      console.log({ record });

      if (!record || record.length < 1) {
        const trade = new Transaction({
          trader: user.chatId,
          marketCap: { buy: marketCap },
          tokenQtty,
          usdValue: { buy: price },
          isOpen: true,
          token: {
            symbol: symbol,
            name: name,
            ca,
          },
        });

        trade.save();
      } else {
        const prevBuy = await record.usdValue.buy;
        record.usdValue.buy += amount;
        record.tokenQtty += tokenQtty;

        console.log({ prevBuy, recordSecond: record.usdValue.buy });

        record.save();
      }

      const prevStats = user.stats;
      const newStats = {
        count: prevStats.count + 1,
        volume: prevStats.volume + amount,
      };

      // debit the user and update stats
      const newBalance = balance - amount;
      user.balance = newBalance;
      user.stats = newStats;
      user.save();

      return {
        success: true,
        data: { buy: { mc: marketCap, price }, quantity: tokenQtty },
      };
    } catch (error: any) {
      console.log({ error });
      return {
        success: false,
        message: "An error occurred while processing your transaction ⚠️",
      };
    }
  }

  async positions(chatId: number): Promise<{
    success: boolean;
    message?: string;
    data?: IPosition[];
    meta?: { balance: number; trades: { count: number } };
  }> {
    try {
      connectMongoDB();

      // clear all transactions from database!!!
      // this.emptyStorage();

      const trades = await Transaction.find({ trader: chatId, isOpen: true });
      console.log({ tradesFromTransactionsHelper: trades });

      const user = await User.findOne({ chatId });
      const balance = user.balance;

      if (!trades)
        return {
          success: false,
          message: "Your wallet is as clean as a rugged project",
        };
      return {
        success: true,
        data: trades,
        meta: { balance, trades: { count: trades.length } },
      };
    } catch (error: any) {
      console.log({ error });
      return {
        success: false,
        message: "An error occurred while fetching your positions ⚠️",
      };
    }
  }

  async emptyStorage() {
    connectMongoDB();
    await Transaction.deleteMany();
  }
}

const meme = new Meme();
export default meme;
