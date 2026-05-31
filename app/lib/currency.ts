export const EXCHANGE_RATE_USD = 16000;

export const parseCurrencyToNumber = (
  currencyString: string | number,
): number => {
  if (!currencyString) return 0;
  const str = String(currencyString);
  // Menggabungkan logika dari Transaction.tsx & Report.tsx agar solid
  if (str.includes("$") || str.includes("USD")) {
    const numericPart = str.replace(/[^0-9.]/g, "");
    return Math.round(parseFloat(numericPart) * EXCHANGE_RATE_USD) || 0;
  }
  return parseInt(str.replace(/[^0-9-]/g, ""), 10) || 0;
};

export const formatCurrency = (angka: number, currencyCode: string) => {
  const locale = currencyCode === "USD" ? "en-US" : "id-ID";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "USD" ? 2 : 0,
    maximumFractionDigits: currencyCode === "USD" ? 2 : 0,
  }).format(angka);
};

export const convertAndFormatCurrency = (
  rawIdr: number,
  currencyCode: string,
) => {
  const finalValue =
    currencyCode === "USD" ? rawIdr / EXCHANGE_RATE_USD : rawIdr;
  return formatCurrency(finalValue, currencyCode);
};
