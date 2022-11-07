import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/evm-utils";
import { MoralisItem } from "../../interfaces";
import { moralis_parse } from "../parsing/moralis/moralisparser";

const chain = EvmChain.ETHEREUM;

// const fetch_1_moralis = async (next: string | undefined, counter: number) => {
//   let cursor = "";
//   if (next != undefined) cursor = next;
//   const transactions = await Moralis.EvmApi.nft.getWalletNFTTransfers({
//     address: <string>global.walletAddress,
//     chain: chain,
//     cursor: cursor,
//   });
//   const dataString = JSON.stringify(transactions.toJSON(), null, 4);
//   const data = JSON.parse(dataString);
//   if (transactions.pagination.cursor != null) fetch_1_moralis(transactions.pagination.cursor, counter + 1);
//   else {
//     global.is_fetching_moralis = false;
//   }
// };

const fetch_1_moralis = async (next: string | undefined, counter: number) => {
  let cursor = "";
  if (next != undefined) cursor = next;
  const promise = Moralis.EvmApi.nft
    .getWalletNFTTransfers({
      address: <string>global.walletAddress,
      chain: chain,
      cursor: cursor,
    })
  return promise;
};

export const get_moralis_data = async () => {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  global.is_fetching_moralis = true;
  let next: string | undefined = undefined;
  const promise:any = [];
  while(global.is_fetching_moralis) {
    let data = await fetch_1_moralis(next, 0)
    .then((res) => {
      if(res.pagination.cursor != null) next = res.pagination.cursor;
      else global.is_fetching_moralis = false;
      return res;
    }).then((res) => JSON.stringify(res.toJSON(), null, 4))
    .then((data) => {
      JSON.parse(data);
      promise.push(data);
    })
  }
  return Promise.all(promise);
};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const moralis_call_amount_check = async () => {
  if (globalThis.moralis_call_count >= 24) {
    await sleep(1);
    globalThis.moralis_call_count = 0;
  } else {
    globalThis.moralis_call_count += 1;
  }
};

export const fetch_moralis_contract_data = async (address: string): Promise<string> => {
  // Make sure to not exceed 25 moralis calls per second
  await moralis_call_amount_check();

  return Moralis.EvmApi.nft.getNFTContractMetadata({
    address: address,
    chain: chain,
  }).then((res) => { 
    if(res != null){
      const dataString = JSON.stringify(res.toJSON(), null, 4);
      return JSON.parse(dataString);
    } else {
      return 'undefined';
    }
  });
};
