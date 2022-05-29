<template>
  <div>
    <h1>This is an about page</h1>
    <n-button
      type="primary"
      :ghost="false"
      strong
      class="bg-cyberYellow-100 mt-4"
      @click="transact"
    >
      <template #icon>
        <n-icon>
          <LinkSquare16Regular />
        </n-icon>
      </template>
      Connect you wallet
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from "naive-ui";
import { LinkSquare16Regular } from "@vicons/fluent";
// import { ethers } from "ethers";
// import { abi } from "../../cadmusRouter.json";
// import { useWalletStore } from "@/stores/wallet";

const transact = () => {
  console.log("transact");
  // const walletStore = useWalletStore();
  // const biconomy = new Biconomy(walletStore.walletProvider, {
  //   apiKey: "tyly97HsC.866acc0c-666f-4bbe-bd6e-5df117e03cd5",
  //   debug: true,
  // });
  // console.log(biconomy);
  // const ethersProvider = new ethers.providers.Web3Provider(biconomy);
  // const contractInstance = new ethers.Contract(
  //   "0x76e296b00b08489AAdA383E6Bfc7C41909ec75fa",
  //   abi,
  //   ethersProvider
  // );
  // console.log(contractInstance);
};
</script>

<style></style>
