<script setup lang="ts">
import { NButton, NIcon } from "naive-ui";
import { LinkSquare16Regular } from "@vicons/fluent";
import { useErrorManager } from "@/stores/error";
import router from "@/router";
import { walletConnect, walletLibrary } from "@/stores/wallet";

async function connectWallet() {
  const errorManager = useErrorManager();
  await walletConnect();
  // console.log(walletStore.walletLibrary?.getNetwork());
  if (errorManager.walletError !== "") {
    alert(errorManager.walletError);
  } else {
    console.log(walletLibrary);
    router.push("/swap");
  }
}
</script>
<template>
  <main class="tw-h-full">
    <div
      class="tw-h-full tw-w-full tw-flex tw-flex-row tw-flex-nowrap tw-justify-center tw-items-center"
    >
      <div
        class="tw-max-w-sm tw-w-full tw-rounded tw-flex tw-flex-col tw-flex-nowrap tw-justify-center tw-items-center tw-bg-raisinBlack-80 tw-py-6 tw-px-8"
      >
        <h1 class="tw-text-h2 tw-font-bold tw-text-cyberYellow-100">DeEasy</h1>
        <div class="tw-text-subtitle1 tw-font-semibold">
          A simpler new world order
        </div>
        <n-button
          type="primary"
          :ghost="false"
          block
          strong
          class="tw-bg-cyberYellow-100 tw-mt-4"
          @click="connectWallet"
        >
          <template #icon>
            <n-icon>
              <LinkSquare16Regular />
            </n-icon>
          </template>
          Connect you wallet
        </n-button>
      </div>
    </div>
  </main>
</template>
