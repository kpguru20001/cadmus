/* eslint-disable no-undef */
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
            :validator="validator"
            size="large"
            v-model:value="inputTokenValue"
          >
            <template #suffix>
              <a class="tw-text-raisinBlack-110">{{ walletBalance }}</a>
            </template>
          </n-input-number>
          <n-select
            :style="{
              width: '25%',
            }"
            size="large"
            placeholder="Token"
            :options="selectOptions"
          />
        </n-input-group>
      </div>
      <div class="tw-text-raisinBlack-90 tw-mt-4">
        <n-input-group>
          <n-input-number
            :style="{ width: '75%' }"
            :show-button="false"
            :keyboard="{ ArrowUp: false, ArrowDown: false }"
            :validator="validator"
            size="large"
            v-model:value="inputTokenValue"
          >
            <template #suffix>
              <a class="tw-text-raisinBlack-110">{{ walletBalance }}</a>
            </template>
          </n-input-number>
          <n-select
            :style="{
              width: '25%',
            }"
            size="large"
            placeholder="Token"
            :options="selectOptions"
          />
        </n-input-group>
      </div>
      <n-button
        type="primary"
        block
        strong
        class="tw-bg-cyberYellow-100 tw-mt-4 tw-px-0"
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
        class=" tw-flex tw-w-full tw-flex-col tw-flex-nowrap tw-justify-start tw-items-center tw-mt-4 collapse"
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
          class=" tw-w-full tw-flex tw-flex-col tw-flex-nowrap tw-justify-start tw-items-center tw-mt-4"
        >
          <div class="tw-text-subtitle1 tw-mb-4">Transaction Settings</div>
          <div
            class=" tw-flex tw-flex-row tw-flex-nowrap tw-justify-center tw-items-center tw-w-full"
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
            class=" tw-flex tw-flex-row tw-flex-nowrap tw-justify-center tw-items-center tw-mt-2 tw-w-full"
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
} from '@vicons/fluent';
import {
  NButton,
  NIcon,
  NInputGroup,
  NSelect,
  NInputNumber,
  NCard,
  NCollapseTransition,
  NSpace,
} from 'naive-ui';
import { Ref, ref } from 'vue';
import {
  Currency,
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
  currencyEquals
} from '@pancakeswap-libs/sdk';
import TokenList from '../utils/tokenList.json';
import { ethers } from 'ethers';
const selectOptions = ref([
  {
    label: 'AAVE',
    value: 'AAVE',
  },
  {
    label: 'ETH',
    value: 'ETH',
  },
  {
    label: 'MATIC',
    value: 'MATIC',
  },
]);
interface EToken {
  name: string;
  symbol: string;
  chainId: any;
  decimal: number;
  logoURI: string;
  address: string;
}

const token0: Ref<any | EToken> = ref();
const token1: Ref<any | EToken> = ref();
const token0Balance = ref('0.00');
const token1Balance = ref('0.00');
const userAmountInput0 = ref();
const userAmountInput1 = ref();
const slippage: Ref<number> = ref(50);
const allowance: Ref<any> = ref();
const priceImpact: Ref<string> = ref('0.00');
const valueIn: Ref<string> = ref();
const deadline: Ref<number> = ref();
const path: Ref<string[]> = ref();
const amountOut: Ref<string> = ref();
const amountInCurrency: Ref<boolean> = ref(true);
const tradeObject: Ref<any> = ref();
const customHttpProvider = new ethers.providers.JsonRpcProvider(
  'https://bsc-dataseed.binance.org/'
);
const amount: Ref<string> = ref('0.0');
let fromAmount: number;
let toAmount: number;

const inputTokenValue = ref(0.0);
try {
  if (amountInCurrency.value) {
    fromAmount = parseFloat(amount.value);
    let slippageTolerance = new Percent(JSBI.BigInt(slippage.value), '10000'); // 50 bips, or 0.50%
    toAmount =
      parseFloat(
        tradeObject.value.minimumAmountOut(slippageTolerance).raw.toString()
      ) / parseFloat(Number(10 ** token1.value.decimals).toString());
  } else {
    toAmount = parseFloat(amount.value);
    let slippageTolerance = new Percent(JSBI.BigInt(slippage.value), '10000'); // 50 bips, or 0.50%
    fromAmount =
      parseFloat(
        tradeObject.value.maximumAmountIn(slippageTolerance).raw.toString()
      ) / parseFloat(Number(10 ** token0.value.decimals).toString());
  }
} catch (err) {
  console.log(err)
}

function handleFromAmountChange(value: string) {
  // setAmount(value);
  // setAmountInCurrency(true);
}
function handleToAmountChange(value: string) {
  // setAmount(value);
  // setAmountInCurrency(false);
}
async function AllPairs(tokenA: any, tokenB: any) {
  let pairArray, pair;
  const mainnetTokensBSC = {
    wbnb: new Token(
      ChainId.MAINNET,
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      18,
      'WBNB',
      'Wrapped BNB',
      'https://www.binance.com/'
    ),
    libre: new Token(
      ChainId.MAINNET,
      '0x63db060697b01c6f4a26561b1494685DcbBd998c',
      18,
      'LIBRE',
      'Libre Token',
      'https://www.libredefi.io'
    ),
    // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
    bnb: new Token(
      ChainId.MAINNET,
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      18,
      'BNB',
      'BNB',
      'https://www.binance.com/'
    ),
    cake: new Token(
      ChainId.MAINNET,
      '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      18,
      'CAKE',
      'PancakeSwap Token',
      'https://pancakeswap.finance/'
    ),

    nft: new Token(
      ChainId.MAINNET,
      '0x1fC9004eC7E5722891f5f38baE7678efCB11d34D',
      6,
      'NFT',
      'APENFT',
      'https://apenft.org'
    ),
    dai: new Token(
      ChainId.MAINNET,
      '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      18,
      'DAI',
      'Dai Stablecoin',
      'https://www.makerdao.com/'
    ),
    usdt: new Token(
      ChainId.MAINNET,
      '0x55d398326f99059fF775485246999027B3197955',
      18,
      'USDT',
      'Tether USD',
      'https://tether.to/'
    ),
    eth: new Token(
      ChainId.MAINNET,
      '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      18,
      'ETH',
      'Binance-Peg Ethereum Token',
      'https://ethereum.org/en/'
    ),
    usdc: new Token(
      ChainId.MAINNET,
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      18,
      'USDC',
      'Binance-Peg USD Coin',
      'https://www.centre.io/usdc'
    ),
    busd: new Token(
      ChainId.MAINNET,
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      18,
      'BUSD',
      'Binance USD',
      'https://www.paxos.com/busd/'
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
  let tokenArray = [...Common_Base, tokenA, tokenB];
  tokenArray = tokenArray.filter((v, i) => tokenArray.indexOf(v) === i);

  pairArray = await Promise.all(
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
  );
  pairArray = [].concat(...pairArray);
  pairArray = pairArray.filter(function (element) {
    return element !== undefined;
  });
  pairArray = pairArray.filter(
    (v, i, a) =>
      a.findIndex(
        (t) => t.liquidityToken.address === v.liquidityToken.address
      ) === i
  );
  return pairArray;
}
function isTradeBetter(
  tradeA: any,
  tradeB: any,
  minimumDel: any,
  userChain: 'BSC' | 'AVAX' | 'POLY'
): boolean | undefined {
  const ZERO_PERCENT = new Percent('0');
  const ONE_HUNDRED_PERCENT = new Percent('1');
  const minimumDelta = minimumDel ? minimumDel : ZERO_PERCENT;

  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error('Trades are not comparable');
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  }
  return tradeA.executionPrice.raw
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice);
}
async function setTrade() {
  try {
    let TokenA, TokenB;
    if (token0.value.symbol === ETHER.symbol) {
      TokenA = WETH[ChainId.MAINNET];
      TokenB = await Fetcher.fetchTokenData(
        token1.value.chainId,
        token1.value.address,
        customHttpProvider
      );
    } else if (token1.value.symbol === ETHER.symbol) {
      TokenB = WETH[ChainId.MAINNET];
      TokenA = await Fetcher.fetchTokenData(
        token0.value.chainId,
        token0.value.address,
        customHttpProvider
      );
    } else {
      TokenA = await Fetcher.fetchTokenData(
        token0.value.chainId,
        token0.value.address,
        customHttpProvider
      );
      TokenB = await Fetcher.fetchTokenData(
        token1.value.chainId,
        token1.value.address,
        customHttpProvider
      );
    }

    let amountIn, amountOut;

    if (amountInCurrency.value) {
      amountIn = ethers.utils.parseUnits(
        String(userAmountInput0.value),
        token0.value.decimals
      );
      amountOut = ethers.utils.parseUnits(
        String(toAmount),
        token1.value.decimals
      );
    } else {
      amountIn = ethers.utils.parseUnits(
        String(fromAmount),
        token0.value.decimals
      );
      amountOut = ethers.utils.parseUnits(
        String(userAmountInput1.value),
        token1.value.decimals
      );
    }
    const MAX_HOP = 3;
    const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(
      JSBI.BigInt(50),
      JSBI.BigInt(10000)
    );
    var SwapAmountIn = amountIn.toString();
    var SwapAmountOut = amountOut.toString();
    let bestTradeSoFar: any = null;
    let currentTrade: any;
    if (amountInCurrency.value) {
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
            userChain
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
      }
    } else {
      let allpairs = await AllPairs(TokenB, TokenA);
      for (let i = 1; i < MAX_HOP; i++) {
        currentTrade =
          Trade.bestTradeExactOut(
            allpairs,
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
            userChain
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
      }
    }
    setTradeObject(bestTradeSoFar);

    if (bestTradeSoFar === null) {
      setNoLiquidity(true);
    } else {
      setNoLiquidity(false);
    }
    TAmount = bestTradeSoFar.route.midPrice.toSignificant(6);
    invertAmount = bestTradeSoFar.route.midPrice.invert().toSignificant(6);
    setDisplayRate(TAmount);
    setInvertDisplayRate(invertAmount);
    setButtonBool(true);
  } catch (err) {
    console.log('Set Trade Error -', err);
  }
}
async function calculateAllowance() {
  try {
    if (token0.value != undefined) {
      if (token0.value.symbol === ETHER.symbol) {
        // setToggleSwapButton(true);
      } else {
        // setToggleSwapButton(false);

        const bep20Token = await new ethers.Contract(
          Bep20ABI,
          token0.value.address
        );
        const allowance = await bep20Token.methods
          .allowance(address, ROUTER_ADDRESS)
          .call();
        // setAllowance(allowance);
        // setPriceImpact('0.0');
        if (
          userAmountInput0.value != (null || 0) &&
          ethers.BigNumber.from(ethers.utils.parseEther(allowance)).gt(
            ethers.BigNumber.from(
              ethers.utils.parseEther(userAmountInput0.value)
            )
          )
        ) {
          // setToggleSwapButton(true);
        }
      }
    } else if (token0.value != undefined && token1.value != undefined) {
      if (
        token0.value.symbol === ETHER.symbol &&
        token1.value.symbol === WETH[ChainId.MAINNET].symbol
      ) {
        // setToggleSwapButton(false);
        const bep20Token = await new ethers.Contract(
          Bep20ABI,
          WETH[ChainId.MAINNET].address
        );
        const allowance = await bep20Token.methods
          .allowance(WETH[ChainId.MAINNET].address, ROUTER_ADDRESS)
          .call();
        // setAllowance(allowance);

        if (
          userAmountInput0.value != null &&
          allowance > userAmountInput0.value
        ) {
          // setToggleSwapButton(true);
        }
      }
    } else {
      // console.log("token not selected")
    }
  } catch (err) {
    console.log('allowance - ', err);
  }
}
async function ApproveToken() {
  // if (web3ChainId !== 56) {
  // } else {
  if (token0.value != undefined) {
    try {
      const bep20Token = await new ethers.Contract(Bep20ABI, token0.address);
      const maxAmt = ethers.BigNumber.from('1000000000000000000000000000000');
      // setApproving(true);
      const approveBool = await bep20Token.methods
        .approve(ROUTER_ADDRESS, maxAmt)
        .send({ from: address });
      if (approveBool) {
        // setToggleSwapButton(approveBool);
      }
    } catch (err) {
      console.log('Approving - ', err);
    }
  }
  // }
}

const SwapTokens = async (): Promise<any> => {
  if (
    token0.value.address === WETH[ChainId.MAINNET].address &&
    token1.value.address === WETH[ChainId.MAINNET].address
  ) {
    if (token0.value.symbol != token1.symbol) {
      if (token0.value.symbol === ETHER.symbol) {
        // setButtonBool(true);
        const tokenDecimals = token0.value.decimals;
        let amountIn;
        if (amountInCurrency.value) {
          amountIn = ethers.utils.parseUnits(
            String(userAmountInput0.value),
            tokenDecimals
          );
        } else {
          amountIn = ethers.utils.parseUnits(String(fromAmount), tokenDecimals);
        }
        var SwapAmountIn = amountIn.toString();
        const amountInHex = ethers.BigNumber.from(SwapAmountIn).toHexString();
        setValueIn(amountInHex);
        setAmountOut(amountInHex);
        setSwapCase(3);
      } else {
        setButtonBool(true);
        const tokenDecimals = token0.value.decimals;
        let amountIn;
        if (amountInCurrency) {
          amountIn = ethers.utils.parseUnits(
            String(userAmountInput0.value),
            tokenDecimals
          );
        } else {
          amountIn = ethers.utils.parseUnits(String(fromAmount), tokenDecimals);
        }
        var SwapAmountIn = amountIn.toString();
        const amountInHex = ethers.BigNumber.from(SwapAmountIn).toHexString();
        setValueIn(amountInHex);
        setAmountOut(amountInHex);
        setSwapCase(4);
      }
    }
  } else if (token0.value.symbol === ETHER.symbol) {
    // BNB -> Token
    setButtonBool(true);
    var slippageTolerance = new Percent(BigInt(slippage.value), '10000'); // 50 bips, or 0.50%
    setPriceImpact(tradeObject.value.priceImpact.toSignificant(6));
    var amountOutMin =
      tradeObject.value.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    var value = tradeObject.value.inputAmount.raw; // // needs to be converted to e.g. hex
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const amountOutMinHex = ethers.BigNumber.from(
      amountOutMin.toString()
    ).toHexString();
    const amountInHex = ethers.BigNumber.from(
      value.value.toString()
    ).toHexString();
    const path: string[] = tradeObject.value.route.path.map(
      (token) => token.address
    );
    //  set state for swap
    setAmountOut(amountOutMinHex);
    setDeadline(deadline);
    setValueIn(amountInHex);
    setPath(path);
    setSwapCase(0);
  } else if (token1.symbol === ETHER.symbol) {
    // Token -> BNB

    setButtonBool(true);
    const price = tradeObject.value.priceImpact.toSignificant(6);
    setPriceImpact(price);
    var slippageTolerance = new Percent(BigInt(slippage.value), '10000'); // 50 bips, or 0.50%
    var amountOutMin = tradeObject.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    var value = tradeObject.value.inputAmount.raw; // // needs to be converted to e.g. hex
    const amountOutMinHex = ethers.BigNumber.from(
      amountOutMin.toString()
    ).toHexString();
    const amountInHex = ethers.BigNumber.from(
      value.value.toString()
    ).toHexString();
    const path: string[] = tradeObject.value.route.path.map(
      (token) => token.address
    );
    setAmountOut(amountOutMinHex);
    setDeadline(deadline);
    setValueIn(amountInHex);
    setPath(path);
    setSwapCase(1);
  } else {
    setButtonBool(true);
    var slippageTolerance = new Percent(BigInt(slippage.value), '10000'); // 50 bips, or 0.50%
    const price = tradeObject.value.priceImpact.toSignificant(6);
    setPriceImpact(price);
    var amountOutMin =
      tradeObject.value.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    var value = tradeObject.value.inputAmount.raw; // // needs to be converted to e.g. hex
    const amountOutMinHex = ethers.BigNumber.from(
      amountOutMin.toString()
    ).toHexString();
    const amountInHex = ethers.BigNumber.from(
      value.value.toString()
    ).toHexString();
    const path: string[] = tradeObject.value.route.path.map(
      (token) => token.address
    );
    setAmountOut(amountOutMinHex);
    setDeadline(deadline);
    setValueIn(amountInHex);
    setPath(path);
    setSwapCase(2);
  }
};
const walletBalance = ref(10.3);
const showAdvancedOptions = ref(false);
const validator = (x: number) => x <= walletBalance.value;

const transact = () => {
  console.log('transact');
};
</script>

<style>
.collapse:nth-child(n) {
  width: 100%;
}
.collapse > div {
  width: 100%;
}
</style>
