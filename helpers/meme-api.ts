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

  async data(ca: string): Promise<ITokenData> {
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
}

const meme = new Meme();
export default meme;
