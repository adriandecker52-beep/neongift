const LABELS: Record<string, { name: string; network: string }> = {
  USDT_TRC20: { name: "USDT", network: "Tron (TRC20)" },
  USDT_ERC20: { name: "USDT", network: "Ethereum (ERC20)" },
  USDT_BSC: { name: "USDT", network: "BNB Smart Chain (BEP20)" },
  USDT_SOL: { name: "USDT", network: "Solana" },
  USDT_TON: { name: "USDT", network: "TON" },
  USDC_ERC20: { name: "USDC", network: "Ethereum (ERC20)" },
  USDC_SOL: { name: "USDC", network: "Solana" },
  USDC_BASE: { name: "USDC", network: "Base" },
  BTC: { name: "Bitcoin", network: "Bitcoin" },
  ETH: { name: "Ethereum", network: "Ethereum" },
  LTC: { name: "Litecoin", network: "Litecoin" },
  TON: { name: "Toncoin", network: "TON" },
  SOL: { name: "Solana", network: "Solana" },
  TRX: { name: "Tron", network: "Tron" },
  BNB: { name: "BNB", network: "BNB Smart Chain" },
};

const DEFAULT = ["USDT_TRC20", "USDT_ERC20", "USDT_BSC", "USDC_ERC20", "BTC", "ETH", "LTC", "TON", "SOL"];

export function enabledCoins() {
  const raw = process.env.TRYBIT_CURRENCIES;
  const codes = raw
    ? raw.split(",").map((code) => code.trim().toUpperCase()).filter(Boolean)
    : DEFAULT;
  return codes.map((code) => ({ code, ...coinLabel(code) }));
}

export function coinLabel(code: string) {
  return LABELS[code] ?? { name: code.split("_")[0], network: code.includes("_") ? code.split("_")[1] : code };
}

export type Coin = ReturnType<typeof enabledCoins>[number];
