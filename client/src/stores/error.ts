import { defineStore } from "pinia";

export const useErrorManager = defineStore("errorManager", {
  state: () => {
    return { walletError: "" };
  },
  actions: {
    setWalletError(error: string) {
      this.walletError = error;
    },
  },
});
