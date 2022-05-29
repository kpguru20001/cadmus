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
import { ref } from "vue";

const selectOptions = ref([
  {
    label: "AAVE",
    value: "AAVE",
  },
  {
    label: "ETH",
    value: "ETH",
  },
  {
    label: "MATIC",
    value: "MATIC",
  },
]);

const inputTokenValue = ref(0.0);
const walletBalance = ref(10.3);
const showAdvancedOptions = ref(false);
const validator = (x: number) => x <= walletBalance.value;

const transact = () => {
  console.log("transact");
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
