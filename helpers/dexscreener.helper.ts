interface ITokenData {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  address: string;
  name: string;
  fdv_usd: string;
  market_cap_usd: string;
  volume_usd: ITokenDataTimestamps;
  price_change_percentage: ITokenDataTimestamps;
}

interface ITokenDataTimestamps {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

export const fetchTokenData = async (
  ca: string
): Promise<{
  success: boolean;
  data?: ITokenData;
  message?: string;
}> => {
  try {
    const url = ca
      ? `${process.env.API_BASE_URL!}/networks/solana/pools/${ca}`
      : "";
    console.log({ url });
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch token data");
    const res = await response.json();

    const {
      base_token_price_usd,
      base_token_price_native_currency,
      address,
      name,
      fdv_usd,
      market_cap_usd,
      volume_usd,
      price_change_percentage,
      transactions,
    } = res.data.attributes;

    console.log({
      base_token_price_usd,
      base_token_price_native_currency,
      address,
      name,
      fdv_usd,
      market_cap_usd,
      volume_usd,
      price_change_percentage,
      transactions,
    });

    console.log({ response: res.data });
    return {
      success: true,
      data: {
        base_token_price_usd,
        base_token_price_native_currency,
        address,
        name,
        fdv_usd,
        market_cap_usd,
        volume_usd,
        price_change_percentage,
      },
    };
  } catch (error: any) {
    console.log({ error });
    return { success: false, message: error.message };
  }
};
