interface ITokenData {
  price_usd: string;
  address: string;
  name: string;
  symbol: string;
  fdv_usd: string;
  total_reserve_in_usd: string;
  image_url: string;
  volume_usd: ITokenDataTimestamps;
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
      ? `${process.env.API_BASE_URL!}/networks/solana/tokens/${ca}`
      : "";
    console.log({ url });
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch token data");
    const res = await response.json();

    console.log({ res: res.data.attributes });

    const {
      price_usd,
      total_reserve_in_usd,
      address,
      name,
      symbol,
      fdv_usd,
      volume_usd,
      image_url,
    } = res.data.attributes;

    return {
      success: true,
      data: {
        price_usd,
        address,
        name,
        symbol,
        fdv_usd,
        volume_usd,
        total_reserve_in_usd,
        image_url,
      },
    };
  } catch (error: any) {
    console.log({ error });
    return { success: false, message: error.message };
  }
};
