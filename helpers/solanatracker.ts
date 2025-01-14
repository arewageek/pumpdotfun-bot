class Token {
  baseUrl = "https://data.solanatracker.io";

  async data(ca: string) {
    const url = `${this.baseUrl}/tokens/${ca}`;
    const response = await fetch(url);
    const res = await response.json();
    console.log({ res: await res });
  }
}

const token = new Token();
export default token;
