<template>
  <div
    class="tw-flex tw-flex-col tw-flex-nowrap tw-justify-start tw-items-center"
  >
    <div class="tw-text-h4">Token Swapper</div>
    <n-card class="tw-max-w-lg tw-mt-4">
      <div class="tw-text-white tw-text-h6 tw-mb-4 tw-mx-2">Swap</div>
      <div class="tw-text-raisinBlack-90">
        <n-input-group>
          <n-input-number
            :style="{ width: '75%' }"
            :show-button="false"
            :keyboard="{ ArrowUp: false, ArrowDown: false }"
            size="large"
            v-model:value="fromAmount"
            @update:value="setFromAmount"
          >
            <template #suffix>
              <a class="tw-text-raisinBlack-110">{{ exchangeRate }}</a>
            </template>
          </n-input-number>
          <n-select
            :style="{
              width: '25%',
            }"
            size="large"
            placeholder="Token"
            :options="getFromTokenOptions"
            v-model:value="fromTokenValue"
          />
        </n-input-group>
      </div>
      <div class="tw-text-raisinBlack-90 tw-mt-4">
        <n-input-group>
          <n-input-number
            :style="{ width: '75%' }"
            :show-button="false"
            :keyboard="{ ArrowUp: false, ArrowDown: false }"
            size="large"
            v-model:value="toAmount"
            @update:value="setToAmount"
          >
            <template #suffix>
              <a class="tw-text-raisinBlack-110">{{ inverseExchangeRate }}</a>
            </template>
          </n-input-number>
          <n-select
            :style="{
              width: '25%',
            }"
            size="large"
            placeholder="Token"
            :options="getToTokenOptions"
            v-model:value="toTokenValue"
          />
        </n-input-group>
      </div>
      <n-button
        type="primary"
        block
        strong
        class="tw-bg-cyberYellow-100 tw-mt-4 tw-px-0"
        @click="swap"
      >
        <template #icon>
          <n-icon>
            <ArrowSwap24Filled />
          </n-icon>
        </template>
        Swap
      </n-button>
      <n-space
        vertical
        class="tw-flex tw-w-full tw-flex-col tw-flex-nowrap tw-justify-start tw-items-center tw-mt-4 collapse"
      >
        <n-button
          quaternary
          @click="showAdvancedOptions = !showAdvancedOptions"
          icon-placement="right"
          block
          class="tw-px-0"
        >
          Show Advanced Options
          <template #icon>
            <n-icon>
              <ChevronUp12Filled v-if="showAdvancedOptions" />
              <ChevronDown12Filled v-if="!showAdvancedOptions" />
            </n-icon>
          </template>
        </n-button>
        <n-collapse-transition
          :show="showAdvancedOptions"
          :style="{
            width: '100%',
          }"
          class="tw-w-full tw-flex tw-flex-col tw-flex-nowrap tw-justify-start tw-items-center tw-mt-4"
        >
          <div class="tw-text-subtitle1 tw-mb-4">Transaction Settings</div>
          <div
            class="tw-flex tw-flex-row tw-flex-nowrap tw-justify-center tw-items-center tw-w-full"
          >
            <div class="tw-basis-1/3 tw-mr-2">Slippage Tolerance?</div>
            <n-input-group class="tw-basis-2/3">
              <n-input-number
                :style="{ width: '80%' }"
                :show-button="false"
                size="small"
                :keyboard="{ ArrowUp: false, ArrowDown: false }"
              />
              <n-button
                :style="{ width: '20%' }"
                type="primary"
                ghost
                size="small"
              >
                Reset
              </n-button>
            </n-input-group>
          </div>
          <div
            class="tw-flex tw-flex-row tw-flex-nowrap tw-justify-center tw-items-center tw-mt-2 tw-w-full"
          >
            <div class="tw-basis-1/3 tw-mr-2">Tx Deadline?</div>
            <n-input-group class="tw-basis-2/3">
              <n-input-number
                :style="{ width: '80%' }"
                :show-button="false"
                size="small"
                :keyboard="{ ArrowUp: false, ArrowDown: false }"
                placeholder="Deadline to complete"
              >
                <template #suffix>
                  <a class="tw-text-raisinBlack-110">min</a>
                </template>
              </n-input-number>
              <n-button
                :style="{ width: '20%' }"
                type="primary"
                ghost
                size="small"
              >
                Reset
              </n-button>
            </n-input-group>
          </div>
        </n-collapse-transition>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowSwap24Filled,
  ChevronUp12Filled,
  ChevronDown12Filled,
} from "@vicons/fluent";
import {
  NButton,
  NIcon,
  NInputGroup,
  NSelect,
  NInputNumber,
  NCard,
  NCollapseTransition,
  NSpace,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import {
  Trade,
  Pair,
  Fetcher,
  Token,
  TokenAmount,
  JSBI,
  ChainId,
  Percent,
  ETHER,
  WETH,
  currencyEquals,
} from "@pancakeswap-libs/sdk";
import { ethers } from "ethers";
import { routerAddress, walletConnect, walletLibrary } from "@/stores/wallet";
import { Bep20ABI } from "@/utils/BEP20";
import ensure from "@/utils/ensure";
// const tokensList = ref([
//   {
//     name: "Libre Token",
//     symbol: "LIBRE",
//     address: "0xF52d69BC301BE21cbed7D3ca652D1708FF8a1162",
//     chainId: 137,
//     decimals: 18,
//   },
//   {
//     chainId: 137,
//     name: "Wrapped Ether",
//     symbol: "WETH",
//     decimals: 18,
//     address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
//   },
//   {
//     chainId: 137,
//     name: "Matic Token",
//     symbol: "MATIC",
//     decimals: 18,
//     address: "0x0000000000000000000000000000000000001010",
//   },
//   {
//     chainId: 137,
//     name: "USD Coin",
//     symbol: "USDC",
//     decimals: 6,
//     address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
//   },
//   {
//     chainId: 137,
//     name: "Tether USD",
//     symbol: "USDT",
//     decimals: 6,
//     address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
//   },
//   {
//     chainId: 137,
//     name: "Dai Stablecoin",
//     symbol: "DAI",
//     decimals: 18,
//     address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
//   },
//   {
//     chainId: 137,
//     name: "Aave",
//     symbol: "AAVE",
//     decimals: 18,
//     address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
//   },
//   {
//     chainId: 137,
//     name: "ChainLink Token",
//     symbol: "LINK",
//     decimals: 18,
//     address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
//   },
//   {
//     chainId: 137,
//     name: "Wrapped BTC",
//     symbol: "WBTC",
//     decimals: 8,
//     address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
//   },
//   {
//     chainId: 137,
//     name: "Uniswap",
//     symbol: "UNI",
//     decimals: 18,
//     address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
//   },
//   {
//     chainId: 137,
//     name: "SushiToken",
//     symbol: "SUSHI",
//     decimals: 18,
//     address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
//   },
//   {
//     chainId: 137,
//     name: "Quickswap",
//     symbol: "QUICK",
//     decimals: 18,
//     address: "0x831753dd7087cac61ab5644b308642cc1c33dc13",
//   },
//   {
//     chainId: 137,
//     name: "Aavegotchi GHST Token",
//     symbol: "GHST",
//     decimals: 18,
//     address: "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7",
//   },
//   {
//     chainId: 137,
//     name: "Telcoin",
//     symbol: "TEL",
//     decimals: 2,
//     address: "0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32",
//   },
//   {
//     chainId: 137,
//     name: "Balancer",
//     symbol: "BAL",
//     decimals: 18,
//     address: "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
//   },
//   {
//     chainId: 137,
//     name: "EthermonToken",
//     symbol: "EMON",
//     decimals: 18,
//     address: "0xd6a5ab46ead26f49b03bbb1f9eb1ad5c1767974a",
//   },
//   {
//     chainId: 137,
//     name: "Furucombo",
//     symbol: "COMBO",
//     decimals: 18,
//     address: "0x6ddb31002abc64e1479fc439692f7ea061e78165",
//   },
//   {
//     chainId: 137,
//     name: "Binance USB",
//     symbol: "BUSD",
//     decimals: 18,
//     address: "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7",
//   },
// ]);
const tokensList = ref([
  {
    name: "WBNB Token",
    symbol: "WBNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png",
  },
  {
    name: "BUSD Token",
    symbol: "BUSD",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png",
  },
  {
    name: "Ethereum Token",
    symbol: "ETH",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png",
  },
  {
    name: "BTCB Token",
    symbol: "BTCB",
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png",
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x55d398326f99059fF775485246999027B3197955.png",
  },
  {
    name: "PancakeSwap Token",
    symbol: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png",
  },
  {
    name: "Venus",
    symbol: "XVS",
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63.png",
  },
  {
    name: "VAI Stablecoin",
    symbol: "VAI",
    address: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7.png",
  },
  {
    name: "Pancake Bunny",
    symbol: "BUNNY",
    address: "0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51.png",
  },
  {
    name: "Alpaca",
    symbol: "ALPACA",
    address: "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F.png",
  },
  {
    name: "Belt",
    symbol: "BELT",
    address: "0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f.png",
  },
  {
    name: "TokoCrypto",
    symbol: "TKO",
    address: "0x9f589e3eabe42ebC94A44727b3f3531C0c877809",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x9f589e3eabe42ebC94A44727b3f3531C0c877809.png",
  },
  {
    name: "Nerve Finance",
    symbol: "NRV",
    address: "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096.png",
  },
  {
    name: "Ellipsis",
    symbol: "EPS",
    address: "0xA7f552078dcC247C2684336020c03648500C6d9F",
    chainId: 56,
    decimals: 18,
    logoURI:
      "https://pancakeswap.finance/images/tokens/0xA7f552078dcC247C2684336020c03648500C6d9F.png",
  },
]);

const fromTokenValue = ref<string>("CAKE");
const toTokenValue = ref<string>("BUSD");
const slippage = ref(50);

const tradeObject = ref<Trade>();
const noLiquidity = ref(false);
const exchangeRate = ref("0.0");
const inverseExchangeRate = ref("0.0");
const fromAmount = ref<number | null>(0.0);
const toAmount = ref<number | null>(0.0);
const walletBalance = ref(10.3);
const inputTokenValue = ref(0.0);
const showAdvancedOptions = ref(false);

const validator = (x: number) => x <= walletBalance.value;

const customHttpProvider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);

const getFromToken = computed(() => {
  return tokensList.value.find((t) => t.symbol === fromTokenValue.value);
});
const getToToken = computed(() => {
  return tokensList.value.find((t) => t.symbol === toTokenValue.value);
});
const getFromTokenOptions = computed(() => {
  return tokensList.value
    .filter((t) => t.symbol !== fromTokenValue.value)
    .map((t) => ({
      label: `${t.symbol} (${t.name})`,
      value: t.symbol,
    }));
});
const getToTokenOptions = computed(() => {
  return tokensList.value
    .filter((t) => t.symbol !== toTokenValue.value)
    .map((t) => ({
      label: `${t.symbol} (${t.name})`,
      value: t.symbol,
    }));
});

const recalculateSwapAmount = async () => {
  await setTrade(true);
  let slippageTolerance = new Percent(JSBI.BigInt(slippage.value), "10000"); // 50 bips, or 0.50%
  toAmount.value =
    tradeObject.value === undefined || getFromToken.value === undefined
      ? 0
      : parseFloat(
          tradeObject.value.minimumAmountOut(slippageTolerance).raw.toString()
        ) / parseFloat(Number(10 ** getFromToken.value.decimals).toString());
};

watch(fromTokenValue, recalculateSwapAmount);
watch(toTokenValue, recalculateSwapAmount);

const setFromAmount = async (amount: number | null) => {
  fromAmount.value = amount;
  await setTrade(true);
  let slippageTolerance = new Percent(JSBI.BigInt(slippage.value), "10000"); // 50 bips, or 0.50%
  toAmount.value =
    tradeObject.value === undefined || getFromToken.value === undefined
      ? 0
      : parseFloat(
          tradeObject.value.minimumAmountOut(slippageTolerance).raw.toString()
        ) / parseFloat(Number(10 ** getFromToken.value.decimals).toString());
};

const setToAmount = async (amount: number | null) => {
  toAmount.value = amount;
  await setTrade(false);
  let slippageTolerance = new Percent(JSBI.BigInt(slippage.value), "10000"); // 50 bips, or 0.50%
  fromAmount.value =
    tradeObject.value === undefined || getToToken.value === undefined
      ? 0
      : parseFloat(
          tradeObject.value.minimumAmountOut(slippageTolerance).raw.toString()
        ) / parseFloat(Number(10 ** getToToken.value.decimals).toString());
};

async function AllPairs(tokenA: Token, tokenB: Token): Promise<Pair[]> {
  let pairArray: (Pair | undefined)[], pair: Pair | undefined;
  const mainnetTokensBSC = {
    wbnb: new Token(
      ChainId.MAINNET,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      18,
      "WBNB",
      "Wrapped BNB"
    ),
    libre: new Token(
      ChainId.MAINNET,
      "0x63db060697b01c6f4a26561b1494685DcbBd998c",
      18,
      "LIBRE",
      "Libre Token"
    ),
    // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
    bnb: new Token(
      ChainId.MAINNET,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      18,
      "BNB",
      "BNB"
    ),
    cake: new Token(
      ChainId.MAINNET,
      "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      18,
      "CAKE",
      "PancakeSwap Token"
    ),

    nft: new Token(
      ChainId.MAINNET,
      "0x1fC9004eC7E5722891f5f38baE7678efCB11d34D",
      6,
      "NFT",
      "APENFT"
    ),
    dai: new Token(
      ChainId.MAINNET,
      "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      18,
      "DAI",
      "Dai Stablecoin"
    ),
    usdt: new Token(
      ChainId.MAINNET,
      "0x55d398326f99059fF775485246999027B3197955",
      18,
      "USDT",
      "Tether USD"
    ),
    eth: new Token(
      ChainId.MAINNET,
      "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      18,
      "ETH",
      "Binance-Peg Ethereum Token"
    ),
    usdc: new Token(
      ChainId.MAINNET,
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      18,
      "USDC",
      "Binance-Peg USD Coin"
    ),
    busd: new Token(
      ChainId.MAINNET,
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      18,
      "BUSD",
      "Binance USD"
    ),
  };
  const Common_Base = [
    mainnetTokensBSC.busd,
    mainnetTokensBSC.cake,
    mainnetTokensBSC.dai,
    mainnetTokensBSC.bnb,
    mainnetTokensBSC.libre,
    mainnetTokensBSC.eth,
    mainnetTokensBSC.dai,
  ];
  let tokenArray: Token[] = [...Common_Base, tokenA, tokenB];
  tokenArray = [...new Set(tokenArray)];
  pairArray = (
    await Promise.all(
      tokenArray.map(async (element0) => {
        let pairs = await Promise.all(
          tokenArray.map(async (element1) => {
            try {
              pair = await Fetcher.fetchPairData(
                element0,
                element1,
                customHttpProvider
              );
              return pair;
            } catch (err) {
              pair = undefined;
              return pair;
            }
          })
        );
        return pairs;
      })
    )
  ).flat();
  pairArray = pairArray.filter(function (element) {
    return element !== undefined;
  });
  pairArray = [...new Set(pairArray)];
  return pairArray.filter((item): item is Pair => !!item);
}
function isTradeBetter(
  tradeA: any,
  tradeB: any,
  minimumDel: any,
  userChain: "BSC" | "AVAX" | "POLY"
): boolean | undefined {
  const ZERO_PERCENT = new Percent("0");
  const ONE_HUNDRED_PERCENT = new Percent("1");
  const minimumDelta = minimumDel ? minimumDel : ZERO_PERCENT;

  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error("Trades are not comparable");
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  }
  return tradeA.executionPrice.raw
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice);
}
async function setTrade(isFromAmountCalculation: boolean) {
  try {
    let TokenA, TokenB;
    if (getFromToken.value === undefined || getToToken.value === undefined) {
      console.log("Error token not defined");
      return;
    }
    if (getFromToken.value.symbol === ETHER.symbol) {
      TokenA = WETH[ChainId.MAINNET];
      TokenB = await Fetcher.fetchTokenData(
        getToToken.value.chainId,
        getToToken.value.address,
        customHttpProvider
      );
    } else if (getToToken.value.symbol === ETHER.symbol) {
      TokenB = WETH[ChainId.MAINNET];
      TokenA = await Fetcher.fetchTokenData(
        getFromToken.value.chainId,
        getFromToken.value.address,
        customHttpProvider
      );
    } else {
      TokenA = await Fetcher.fetchTokenData(
        getFromToken.value.chainId,
        getFromToken.value.address,
        customHttpProvider
      );
      TokenB = await Fetcher.fetchTokenData(
        getToToken.value.chainId,
        getToToken.value.address,
        customHttpProvider
      );
    }

    let amountIn, amountOut;

    amountIn = ethers.utils.parseUnits(
      String(fromAmount.value),
      getFromToken.value.decimals
    );
    amountOut = ethers.utils.parseUnits(
      String(toAmount.value),
      getToToken.value.decimals
    );

    const MAX_HOP = 3;
    const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(
      JSBI.BigInt(50),
      JSBI.BigInt(10000)
    );
    var SwapAmountIn = amountIn.toString();
    var SwapAmountOut = amountOut.toString();
    let bestTradeSoFar: Trade | undefined;
    let currentTrade: Trade;
    if (isFromAmountCalculation) {
      let allpairs = await AllPairs(TokenA, TokenB);
      for (let i = 1; i < MAX_HOP; i++) {
        currentTrade =
          Trade.bestTradeExactIn(
            allpairs,
            new TokenAmount(TokenA, SwapAmountIn),
            TokenB,
            { maxHops: i, maxNumResults: 1 }
          )[0] ?? null;
        //  if current trade is best yet, save it
        if (
          isTradeBetter(
            bestTradeSoFar,
            currentTrade,
            BETTER_TRADE_LESS_HOPS_THRESHOLD as Percent,
            "BSC"
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
      }
    } else {
      let allPairs = await AllPairs(TokenB, TokenA);
      for (let i = 1; i < MAX_HOP; i++) {
        currentTrade =
          Trade.bestTradeExactOut(
            allPairs,
            TokenA,
            new TokenAmount(TokenB, SwapAmountOut),
            { maxHops: i, maxNumResults: 1 }
          )[0] ?? null;
        //  if current trade is best yet, save it
        if (
          isTradeBetter(
            bestTradeSoFar,
            currentTrade,
            BETTER_TRADE_LESS_HOPS_THRESHOLD,
            "BSC"
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
      }
    }
    tradeObject.value = bestTradeSoFar;

    if (bestTradeSoFar === null) {
      noLiquidity.value = true;
    } else {
      noLiquidity.value = false;
    }
    if (bestTradeSoFar === undefined) {
      throw new Error("No trade found");
    }
    exchangeRate.value = bestTradeSoFar.route.midPrice.toSignificant(6);
    inverseExchangeRate.value = bestTradeSoFar.route.midPrice
      .invert()
      .toSignificant(6);
  } catch (err) {
    console.log("Set Trade Error -", err);
  }
}
/*
async function calculateAllowance() {
  try {
    if (getFromToken.value != undefined) {
      if (getFromToken.value.symbol === ETHER.symbol) {
        // setToggleSwapButton(true);
      } else {
        // setToggleSwapButton(false);

        const bep20Token = await new ethers.Contract(
          Bep20ABI,
          getFromToken.value.address
        );
        if (walletLibrary === undefined)
          throw new Error("Wallet Not Initialized");

        const allowance = await bep20Token.methods
          .allowance(walletLibrary.getSigner().getAddress(), routerAddress)
          .call();
        // setAllowance(allowance);
        // setPriceImpact('0.0');
        if (
          fromAmount.value != (null || 0) &&
          ethers.BigNumber.from(ethers.utils.parseEther(allowance)).gt(
            ethers.BigNumber.from(ethers.utils.parseEther(fromAmount.value))
          )
        ) {
          // setToggleSwapButton(true);
        }
      }
    } else if (
      getFromToken.value != undefined &&
      getToToken.value != undefined
    ) {
      if (
        getFromToken.value.symbol === ETHER.symbol &&
        getToToken.value.symbol === WETH[ChainId.MAINNET].symbol
      ) {
        // setToggleSwapButton(false);
        const bep20Token = await new ethers.Contract(
          Bep20ABI,
          WETH[ChainId.MAINNET].address
        );
        const allowance = await bep20Token.methods
          .allowance(WETH[ChainId.MAINNET].address, walletStore.routerAddress)
          .call();
        // setAllowance(allowance);

        if (fromAmount.value != null && allowance > fromAmount.value) {
          // setToggleSwapButton(true);
        }
      }
    } else {
      // console.log("token not selected")
    }
  } catch (err) {
    console.log("allowance - ", err);
  }
} */
async function approveToken() {
  // if (web3ChainId !== 56) {
  // } else {
  if (getFromToken.value != undefined) {
    try {
      const bep20Token = await new ethers.Contract(
        getFromToken.value.address,
        Bep20ABI as any,
        customHttpProvider
      );
      console.log(bep20Token);
      console.log("The Address " + getFromToken.value.address);
      const maxAmt = ethers.BigNumber.from("1000000000000000000000000000000");
      // setApproving(true);
      const sender = await ensure(walletLibrary).getSigner().getAddress();
      console.log("send" + sender);

      await bep20Token.approve(routerAddress, maxAmt).send({ from: sender });
    } catch (err) {
      console.log("Approving - ", err);
    }
  }
  // }
}

const swap = async () => {
  await walletConnect();
  // approveToken();
  openZepSwap();
  console.log("Testing: " + (await walletLibrary?.getSigner().getAddress()));
};

const ForwarderAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "typeHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "typeStr",
        type: "string",
      },
    ],
    name: "RequestTypeRegistered",
    type: "event",
  },
  {
    inputs: [],
    name: "GENERIC_PARAMS",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Forwarder.ForwardRequest",
        name: "req",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "requestTypeHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "suffixData",
        type: "bytes",
      },
    ],
    name: "_getEncoded",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Forwarder.ForwardRequest",
        name: "req",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "domainSeparator",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "requestTypeHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "suffixData",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "ret",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
    ],
    name: "getNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "typeName",
        type: "string",
      },
      {
        internalType: "string",
        name: "typeSuffix",
        type: "string",
      },
    ],
    name: "registerRequestType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "typeHashes",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Forwarder.ForwardRequest",
        name: "req",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "domainSeparator",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "requestTypeHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "suffixData",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "verify",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const relayABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_trustedForwarder",
        type: "address",
      },
    ],
    name: "setTrustForwarder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapETHForExactTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapExactETHForTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapExactTokensForETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapExactTokensForTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountInMax",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapTokensForExactETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountInMax",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swapTokensForExactTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "customRouterAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_trustedForwarder",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "uniswapRouterAddress",
        type: "address",
      },
    ],
    name: "updateUniRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "_unirouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "forwarder",
        type: "address",
      },
    ],
    name: "isTrustedForwarder",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "trustedForwarder",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "versionRecipient",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const RelayUrl =
  "https://api.defender.openzeppelin.com/autotasks/6f4f37fa-6bc8-4c98-9b3c-a6dab88bdac0/runs/webhook/5ca8c6fc-1604-485a-8a30-60c239b25620/9hrvK4TBThw2cWJJMXWNHo";

const EIP712DomainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const ForwardRequestType = [
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "value", type: "uint256" },
  { name: "gas", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "data", type: "bytes" },
];

const ForwarderAddress = "0x051fdfddD0e3b11E7785C80CbfB9dD86097050aA";

const TypedData = {
  domain: {
    name: "Defender",
    version: "1",
    chainId: 4,
    verifyingContract: ForwarderAddress,
  },
  primaryType: "ForwardRequest",
  types: {
    EIP712Domain: EIP712DomainType,
    ForwardRequest: ForwardRequestType,
  },
  message: {},
};

const openZepSwap = async () => {
  setTrade(true);
  await walletConnect();
  const etherProvider = ensure(walletLibrary);
  const signer = etherProvider.getSigner();
  const from = await signer.getAddress();
  const network = await etherProvider.getNetwork();
  if (network.chainId !== 56) throw new Error(`Must be connected to Binance`);

  // Get nonce for current signer
  const forwarder = new ethers.Contract(
    ForwarderAddress,
    ForwarderAbi,
    etherProvider
  );
  const nonce = await forwarder
    .getNonce(from)
    .then((nonce: any) => nonce.toString());

  const amountIn = ethers.utils.parseUnits(
    String(fromAmount.value),
    ensure(getFromToken.value).decimals
  );
  const amountOut = ethers.utils.parseUnits(
    String(toAmount.value),
    ensure(getToToken.value).decimals
  );

  // Encode meta-tx request
  const cadmusInterface = new ethers.utils.Interface(relayABI);
  let expiresInMS = 600000; // let say expiration in 600 s / 10 min
  const deadline = Date.now() + expiresInMS;
  const bestPath = ensure(tradeObject.value).route.path.map((t) => t.address);
  console.log(fromAmount.value);
  console.log(toAmount.value);
  console.log(amountIn);
  console.log(amountOut);
  console.log(bestPath);
  console.log(deadline);
  const data = cadmusInterface.encodeFunctionData("swapExactTokensForTokens", [
    amountIn,
    amountOut,
    bestPath,
    deadline,
  ]);
  const request = {
    from,
    to: relayABI,
    value: 0,
    gas: 1e6,
    nonce,
    data,
  };
  const toSign = { ...TypedData, message: request };
  console.log(data);

  /* const signature = await etherProvider.send("eth_signTypedData_v4", [
    from,
    JSON.stringify(toSign),
  ]);

  // Send request to the server
  const response = await fetch(RelayUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, signature }),
  })
    .then((r) => r.json())
    .catch((e) => console.error(e));
  console.log(response); */
};

// const SwapTokens = async (): Promise<any> => {
//   if (
//     getFromToken.value.address === WETH[ChainId.MAINNET].address &&
//     getToToken.value.address === WETH[ChainId.MAINNET].address
//   ) {
//     if (getFromToken.value.symbol != getToToken.symbol) {
//       if (getFromToken.value.symbol === ETHER.symbol) {
//         // setButtonBool(true);
//         const tokenDecimals = getFromToken.value.decimals;
//         let amountIn;
//         if (amountInCurrency.value) {
//           amountIn = ethers.utils.parseUnits(
//             String(fromAmount.value),
//             tokenDecimals
//           );
//         } else {
//           amountIn = ethers.utils.parseUnits(String(fromAmount), tokenDecimals);
//         }
//         var SwapAmountIn = amountIn.toString();
//         const amountInHex = ethers.BigNumber.from(SwapAmountIn).toHexString();
//         setValueIn(amountInHex);
//         setAmountOut(amountInHex);
//         setSwapCase(3);
//       } else {
//         setButtonBool(true);
//         const tokenDecimals = getFromToken.value.decimals;
//         let amountIn;
//         if (amountInCurrency) {
//           amountIn = ethers.utils.parseUnits(
//             String(fromAmount.value),
//             tokenDecimals
//           );
//         } else {
//           amountIn = ethers.utils.parseUnits(String(fromAmount), tokenDecimals);
//         }
//         var SwapAmountIn = amountIn.toString();
//         const amountInHex = ethers.BigNumber.from(SwapAmountIn).toHexString();
//         setValueIn(amountInHex);
//         setAmountOut(amountInHex);
//         setSwapCase(4);
//       }
//     }
//   } else if (getFromToken.value.symbol === ETHER.symbol) {
//     // BNB -> Token
//     setButtonBool(true);
//     var slippageTolerance = new Percent(BigInt(slippage.value), "10000"); // 50 bips, or 0.50%
//     setPriceImpact(tradeObject.value.priceImpact.toSignificant(6));
//     var amountOutMin =
//       tradeObject.value.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
//     var value = tradeObject.value.inputAmount.raw; // // needs to be converted to e.g. hex
//     var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
//     const amountOutMinHex = ethers.BigNumber.from(
//       amountOutMin.toString()
//     ).toHexString();
//     const amountInHex = ethers.BigNumber.from(
//       value.value.toString()
//     ).toHexString();
//     const path: string[] = tradeObject.value.route.path.map(
//       (token) => token.address
//     );
//     //  set state for swap
//     setAmountOut(amountOutMinHex);
//     setDeadline(deadline);
//     setValueIn(amountInHex);
//     setPath(path);
//     setSwapCase(0);
//   } else if (getToToken.symbol === ETHER.symbol) {
//     // Token -> BNB

//     setButtonBool(true);
//     const price = tradeObject.value.priceImpact.toSignificant(6);
//     setPriceImpact(price);
//     var slippageTolerance = new Percent(BigInt(slippage.value), "10000"); // 50 bips, or 0.50%
//     var amountOutMin = tradeObject.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
//     var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
//     var value = tradeObject.value.inputAmount.raw; // // needs to be converted to e.g. hex
//     const amountOutMinHex = ethers.BigNumber.from(
//       amountOutMin.toString()
//     ).toHexString();
//     const amountInHex = ethers.BigNumber.from(
//       value.value.toString()
//     ).toHexString();
//     const path: string[] = tradeObject.value.route.path.map(
//       (token) => token.address
//     );
//     setAmountOut(amountOutMinHex);
//     setDeadline(deadline);
//     setValueIn(amountInHex);
//     setPath(path);
//     setSwapCase(1);
//   } else {
//     setButtonBool(true);
//     var slippageTolerance = new Percent(BigInt(slippage.value), "10000"); // 50 bips, or 0.50%
//     const price = tradeObject.value.priceImpact.toSignificant(6);
//     setPriceImpact(price);
//     var amountOutMin =
//       tradeObject.value.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
//     var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
//     var value = tradeObject.value.inputAmount.raw; // // needs to be converted to e.g. hex
//     const amountOutMinHex = ethers.BigNumber.from(
//       amountOutMin.toString()
//     ).toHexString();
//     const amountInHex = ethers.BigNumber.from(
//       value.value.toString()
//     ).toHexString();
//     const path: string[] = tradeObject.value.route.path.map(
//       (token) => token.address
//     );
//     setAmountOut(amountOutMinHex);
//     setDeadline(deadline);
//     setValueIn(amountInHex);
//     setPath(path);
//     setSwapCase(2);
//   }
// };
</script>

<style>
.collapse:nth-child(n) {
  width: 100%;
}
.collapse > div {
  width: 100%;
}
</style>
