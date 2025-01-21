export const format = (num: number, decimals?: number): string => {
  return num < 1000
    ? `${Number(num.toFixed(decimals || 0)).toLocaleString()}`
    : num < 1000000
    ? `${(Number(num.toFixed(decimals || 0)) / 1000).toLocaleString()}K`
    : num < 1000000000
    ? `${(Number(num.toFixed(decimals || 0)) / 1000000).toLocaleString()}M`
    : num < 1000000000000
    ? `${(Number(num.toFixed(decimals || 0)) / 1000000000).toLocaleString()}B`
    : `${(Number(num.toFixed(decimals || 0)) / 1000).toLocaleString()}`;
};
