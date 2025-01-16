import { connectMongoDB } from "../lib/mongodb";
import Token from "../models/Token.model";

interface ITokenData {
  success: boolean;
  message?: string;
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

class Meme {
  baseUrl = "https://meme-api.openocean.finance";

  async data(ca: string, user: number): Promise<ITokenData> {
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

      await this.makeSession(ca, user);

      return {
        success: true,
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
}

const meme = new Meme();
export default meme;
