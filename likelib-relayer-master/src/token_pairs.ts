export const TOKENS_SEED_DATA = {
  tokens: [
    {
      symbol: "BTC",
      name: "Bitcoin",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 18,
      displayDecimals: 4
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      decimals: 18,
      displayDecimals: 2
    },
    {
      symbol: "USDT",
      name: "USD Tether",
      address: "0x6b175474e89094c44da98b954eedeac495271d0a",
      decimals: 18,
      displayDecimals: 2
    }
  ],
  pairs: [
      // в споте нет пары BTCETH =(
    // {
    //   base: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    //   quote: "0x6b175474e89094c44da98b954eedeac495271d0f"
    // },
    {
      base: "0x6b175474e89094c44da98b954eedeac495271d0f",
      quote: "0x6b175474e89094c44da98b954eedeac495271d0a",
    },
    {
      base: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      quote: "0x6b175474e89094c44da98b954eedeac495271d0a"
    },
  ]
}
