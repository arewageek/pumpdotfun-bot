import jwt from "jsonwebtoken";

const tokenSecret = process.env.JWT_SECRET!;
export const jwtEncrypt = async (data: any): Promise<string> => {
  const token = jwt.sign(data, "JWTSECRET");

  return token;
};

export const jwtDecrypt = async (token: string) => {
  const payload = jwt.verify(token, "JWTSECRET");

  console.log({ token, payload });

  return payload;
};
