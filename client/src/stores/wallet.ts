import { defineStore } from "pinia";
import { reactive } from "vue";
import Web3Modal, { type IProviderOptions } from "web3modal";
import { ethers } from "ethers";
import { useErrorManager } from "./error";

export const providerOptions = {};
export const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
// Libre export const routerAddress = "0x64e71E143aa724C66C038Ad287C0df23bf694080";
// export const routerAddress = "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let walletProvider: any;
export let walletLibrary: ethers.providers.Web3Provider | undefined;
export const web3Modal = new Web3Modal({
  network: "binance",
  cacheProvider: true,
  providerOptions,
});

export async function walletConnect() {
  try {
    walletProvider = await web3Modal.connect();
    walletLibrary = new ethers.providers.Web3Provider(walletProvider);
    console.log(walletLibrary.getSigner());
  } catch (error) {
    console.log(error);
    useErrorManager().setWalletError("Error connecting to wallet" + error);
  }
}
