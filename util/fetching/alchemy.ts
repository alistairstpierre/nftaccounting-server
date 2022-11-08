import { Trade } from "../../interfaces";
import axios from "axios";

interface LooseObject {
  [key: string]: any;
}

export const get_image_urls = async (trades: Trade[]) => {
  const nfts: LooseObject = {};
  trades.forEach((element) => {
    if (element.contract && element.contract.toLowerCase() == "erc721") {
      if (element.project && element.token_id)
        nfts[`${element.project}${element.token_id}`] = { contractAddress: element.project_address, tokenId: element.token_id };
    } else {
      if (element.project && !nfts.hasOwnProperty(element.project)) {
        nfts[element.project] = { contractAddress: element.project_address, tokenId: element.token_id };
      }
    }
  });
  // send all the nfts to alchemy params
  const data = await fetch_alchemy_meta_data(nfts);
  console.log(data[0]);
  trades.forEach((element) => {
    if (element.project_address && element.token_id) {
      const nft = data.find((x: any) => x.id.tokenId == element.token_id && x.contract.address == element.project_address);
      if (nft && nft.media[0].gateway.includes("alchemyapi")) {
        element.img_url = nft.media[0].gateway;
      } else {
        element.img_url = nft.contractMetadata.openSea.imageUrl;
      }
    }
  });
  return trades;
};

// export const get_image_urls = async (trades: Trade[]) => {
//   console.log("getting image urls");
//   const sortedTrades: LooseObject = {};
//   const updatedTrades: Trade[] = [];
//   trades.forEach((trade) => {
//     if (trade.project != undefined) {
//       if (!sortedTrades.hasOwnProperty(trade.project)) {
//         sortedTrades[trade.project] = [];
//       }
//       sortedTrades[trade.project].push(trade);
//     }
//   });
//   for (const [key, value] of Object.entries(sortedTrades)) {
//     if (value[0].contract.toLowerCase() == "erc1155") {
//       // fetch 1 image for all trades of this type of project
//     } else {
//       for (let i = 0; i < value.length; i++) {
//         await alchemy_call_amount_check();
//         // add nfts to a batch call
//         if (value[i].token_id && value[i].project_address) {
//           console.log(value[i].project_address, value[i].token_id);
//           const metadata = fetch_alchemy_meta_data(value[i].project_address, value[i].token_id).then((response) => {
//             if (response.media[0].gateway.includes("alchemyapi")) value[i].img_url = response.media[0].gateway;
//             else value[i].img_url = response.contractMetadata.openSea.imageUrl;
//             updatedTrades.push(value[i]);
//           });
//         }
//       }
//     }
//   }
//   return Promise.all(updatedTrades);
// };

const fetch_alchemy_meta_data = async (nfts: LooseObject) => {
  const apiKey = `${process.env.ALCHEMY_API_KEY}`;
  const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTMetadataBatch`;
  const data: any = [];

  const options = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  };

  for (let i = 0; i < Object.values(nfts).length; i += 100) {
    const batch = Object.values(nfts).slice(i, i + 100);
    const response = await axios.post(baseURL, { tokens: batch }, options).then((res) => {
        res.data.forEach((element:any) => {
            data.push(element)
        });
        
    });
  }
  return Promise.all(data);
};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const alchemy_call_amount_check = async () => {
  console.log("checking alchemy call amount", global.alchemy_call_amount);
  if (globalThis.alchemy_call_amount >= 50) {
    console.log("sleeping for 1 second");
    await sleep(1);
    console.log("sleep finished");
    globalThis.alchemy_call_amount = 0;
  } else {
    globalThis.alchemy_call_amount += 1;
  }
};
