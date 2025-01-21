import jwt from "jsonwebtoken";

export const jwtEncrypt = async (data: any): Promise<string> => {
  const { JWTSECRET } = process.env;
  const token = jwt.sign(data, "JWTSECRET");

  return token;
};

export const jwtDecrypt = async (token: string) => {
  const payload = jwt.decode(token);

  return JSON.stringify(payload);
};
