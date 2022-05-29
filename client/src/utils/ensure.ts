export default function ensure<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
  return value;
}

export interface tokener {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
}

const value2: tokener[] = [
  {
    name: "Libre Token",
    symbol: "LIBRE",
    address: "0xF52d69BC301BE21cbed7D3ca652D1708FF8a1162",
    chainId: 137,
    decimals: 18,
  },
  {
    chainId: 137,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  },
  {
    chainId: 137,
    name: "Matic Token",
    symbol: "MATIC",
    decimals: 18,
    address: "0x0000000000000000000000000000000000001010",
  },
  {
    chainId: 137,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  },
  {
    chainId: 137,
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
  {
    chainId: 137,
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  },
  {
    chainId: 137,
    name: "Aave",
    symbol: "AAVE",
    decimals: 18,
    address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
  },
  {
    chainId: 137,
    name: "ChainLink Token",
    symbol: "LINK",
    decimals: 18,
    address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
  },
  {
    chainId: 137,
    name: "Wrapped BTC",
    symbol: "WBTC",
    decimals: 8,
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
  },
  {
    chainId: 137,
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
  },
  {
    chainId: 137,
    name: "SushiToken",
    symbol: "SUSHI",
    decimals: 18,
    address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
  },
  {
    chainId: 137,
    name: "Quickswap",
    symbol: "QUICK",
    decimals: 18,
    address: "0x831753dd7087cac61ab5644b308642cc1c33dc13",
  },
  {
    chainId: 137,
    name: "Aavegotchi GHST Token",
    symbol: "GHST",
    decimals: 18,
    address: "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7",
  },
  {
    chainId: 137,
    name: "Telcoin",
    symbol: "TEL",
    decimals: 2,
    address: "0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32",
  },
  {
    chainId: 137,
    name: "Balancer",
    symbol: "BAL",
    decimals: 18,
    address: "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
  },
  {
    chainId: 137,
    name: "EthermonToken",
    symbol: "EMON",
    decimals: 18,
    address: "0xd6a5ab46ead26f49b03bbb1f9eb1ad5c1767974a",
  },
  {
    chainId: 137,
    name: "Furucombo",
    symbol: "COMBO",
    decimals: 18,
    address: "0x6ddb31002abc64e1479fc439692f7ea061e78165",
  },
  {
    chainId: 137,
    name: "Binance USB",
    symbol: "BUSD",
    decimals: 18,
    address: "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7",
  },
];
const value: tokener[] = [
  {
    symbol: "USDC",
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    chainId: 137,
    decimals: 6,
    name: "USD Coin",
  },
  {
    symbol: "MATIC",
    address: "",
    chainId: 137,
    decimals: 18,
    name: "Matic Network",
  },
  {
    symbol: "QUICK",
    address: "0x831753dd7087cac61ab5644b308642cc1c33dc13",
    chainId: 137,
    decimals: 18,
    name: "QUICK",
  },
  {
    symbol: "LIBRE",
    address: "0xF52d69BC301BE21cbed7D3ca652D1708FF8a1162",
    chainId: 137,
    decimals: 18,
    name: "Libre",
  },
];
