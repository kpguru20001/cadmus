import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";
import Web3Modal from "web3modal";
import * as contractJSON from "../../cadmusRouter.json";
import sigUtil from "eth-sig-util";

const config: any = {
  contract: {
    address: "0x76e296b00b08489AAdA383E6Bfc7C41909ec75fa",
    abi: contractJSON.abi,
  },
  apiKey: {
    test: "tyly97HsC.866acc0c-666f-4bbe-bd6e-5df117e03cd5",
  },
};

import {
  helperAttributes,
  getDomainSeperator,
  getDataToSignForPersonalSign,
  getDataToSignForEIP712,
  buildForwardTxRequest,
  getBiconomyForwarderConfig,
} from "./biconomyHelpers";

export default async function performTask() {
  console.log("ADMIN");
  const providerOptions = {
    /* See Provider Options Section */
  };
  const web3Modal = new Web3Modal({
    network: "rinkeby", // optional
    cacheProvider: true, // optional
    providerOptions, // required
  });
  const provider = await web3Modal.connect();

  const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
    "https://speedy-nodes-nyc.moralis.io/b8c378e79982e99b0ba90d5b/eth/rinkeby"
  );
  const biconomy = new Biconomy(jsonRpcProvider, {
    walletProvider: provider,
    apiKey: "tyly97HsC.866acc0c-666f-4bbe-bd6e-5df117e03cd5",
    debug: true,
  });

  /*
          This provider is linked to your wallet.
          If needed, substitute your wallet solution in place of window.ethereum 
        */
  const ethersProvider = new ethers.providers.Web3Provider(biconomy);
  const walletProvider = new ethers.providers.Web3Provider(provider);
  const walletSigner = walletProvider.getSigner();
  const userAddress = await walletSigner.getAddress();

  biconomy
    .onEvent(biconomy.READY, async () => {
      // Initialize your dapp here like getting user accounts etc
      console.log("Biconomy is ready");
    })
    .onEvent(biconomy.ERROR, (error: any, message: any): void => {
      // Handle error while initializing mexa
      console.log(message);
      console.log(error);
    });

  setTimeout(async () => {
    const networkId = 4;
    const contract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      biconomy.getSignerByAddress(userAddress)
    );
    const expiresInMS = 600000; // let say expiration in 600 s / 10 min
    const deadline = Date.now() + expiresInMS;
    const { data } = await contract.populateTransaction.swapTokensForTokensNew(
      100000000000000,
      1800000000000000,
      [
        "0xF8f1AE289c0793ace4ddaA4D318AB09E78D8b1A8",
        "0x76e00F029052dCf02a98b4AEc8943Fb0432f3aaa",
      ],
      deadline
    );
    const gasPrice = await ethersProvider.getGasPrice();
    const gasLimit = await ethersProvider.estimateGas({
      to: config.contract.address,
      from: userAddress,
      data: data,
    });
    console.log(gasLimit.toString());
    console.log(gasPrice.toString());

    const forwarder = await getBiconomyForwarderConfig(networkId);
    const forwarderContract = new ethers.Contract(
      forwarder.address,
      forwarder.abi,
      biconomy.getSignerByAddress(userAddress)
    );

    const batchNonce = await forwarderContract.getNonce(userAddress, 0);
    //const batchId = await forwarderContract.getBatch(userAddress);

    console.log(batchNonce);
    const to = config.contract.address;
    const gasLimitNum = Number(gasLimit.toNumber().toString());
    console.log(gasLimitNum);
    const batchId = 0;
    const request = await buildForwardTxRequest({
      account: userAddress,
      to,
      gasLimitNum,
      batchId,
      batchNonce,
      data,
      deadline: undefined,
    });
    console.log(request);

    const domainSeparator = await getDomainSeperator(networkId);
    console.log(domainSeparator);

    const dataToSign = await getDataToSignForEIP712(request, networkId);
    walletProvider
      .send("eth_signTypedData_v3", [userAddress, dataToSign])
      .then(function (sig) {
        let params;
        if (domainSeparator) {
          params = [request, domainSeparator, sig];
        } else {
          params = [request, sig];
        }
        try {
          fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
            method: "POST",
            headers: {
              "x-api-key": config.apiKey.test,
              "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
              to: config.contract.address,
              apiId: "02c5a752-ba09-400c-a8b8-8f5c6aabe7b0",
              params: params,
              from: userAddress,
              signatureType: "EIP712_SIGN",
            }),
          })
            .then((response) => response.json())
            .then(function (result) {
              console.log(result);
              console.log(
                `Transaction sent by relayer with hash ${result.txHash}`
              );
              return result.txHash;
              // todo - fetch mined transaction receipt, show tx confirmed and update quotes
            })
            .then(function (hash) {
              //event emitter methods
              ethersProvider.once(hash, (transaction) => {
                // Emitted when the transaction has been mined
                console.log(transaction);
                console.log(hash);
              });
            })
            .catch(function (error) {
              console.log(error);
            });
        } catch (error) {
          console.log(error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, 2000);
}
