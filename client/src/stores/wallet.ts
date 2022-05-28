import { defineStore } from "pinia";
import { reactive } from "vue";
import Web3Modal, { type IProviderOptions } from "web3modal";
import { ethers } from "ethers";
import { useErrorManager } from "./error";

export const useWalletStore = defineStore("counter", () => {
  const providerOptions = reactive<IProviderOptions>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let walletProvider: any;
  let walletLibrary: ethers.providers.Web3Provider | undefined;
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions,
  });

  async function connect() {
    try {
      walletProvider = await web3Modal.connect();
      walletLibrary = new ethers.providers.Web3Provider(walletProvider);
    } catch (error) {
      console.log(error);
      useErrorManager().setWalletError("Error connecting to wallet" + error);
    }
  }

  return { walletProvider, walletLibrary, web3Modal, connect };
});
