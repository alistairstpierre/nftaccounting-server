import { Trade, Transaction } from "../../interfaces"
import { getExchangeFee, getGasFee } from "../helpers";
import { purchase_type, sale_type, tx_type, type_wth_gas_cost } from "../nft-constants";

export function trades_parse(transactions: Transaction[]) {
  const trades: Trade[] = [];
  const listings: Transaction[] = [];
  const failures: Transaction[] = [];
  const cancels: Transaction[] = [];
  const opensea_expenses: Transaction[] = [];
  const startTime = performance.now();
  let count = 1;
  transactions.forEach((tx) => {
    // if a transaction is a tx type, find its corresponding sale
    if (purchase_type.find((type) => type === tx.type) != undefined) {
      // get an array of potential matches
      const potentialMatches = transactions.filter(
        (t) => t.collection_address === tx.collection_address && t.token_ID === tx.token_ID && sale_type.find((type) => type === t.type) != undefined
      );
      // order the array by date and find the first date after the tx date
      const potentialMatch = potentialMatches.sort((a, b) => Number(a.date) - Number(b.date)).filter((t) => t.date > tx.date);
      let match = undefined;
      if (potentialMatch.length > 0 && potentialMatch[0] != undefined) {
        match = potentialMatch[0];
      }

      const trade: Trade = {
        id: count,
        purchase_type: tx.type,
        purchase_tx: tx.tx_hash,
        sale_type: match != undefined ? match.type : undefined,
        sale_tx: match != undefined ? match.tx_hash : undefined,
        img_url: undefined,
        token_id: tx.token_ID,
        project_address: tx.collection_address,
        project: tx.collection_name,
        date: tx.date,
        cost: tx.price,
        sale: match != undefined ? match.price : undefined,
        fee_gas: getGasFee(tx.type, tx.gas) + (match != undefined ? getGasFee(match?.type, match.gas) : 0),
        fee_exchange: (match != undefined ? getExchangeFee(match.exchange, match.price) : 0),
        fee_royalty: undefined,
        profit:
          (match != undefined ? (match.price != undefined ? match.price : 0) : 0) -
          (match != undefined && type_wth_gas_cost.includes(match.type) ? (match.gas != undefined ? match.gas : 0) : 0) -
          (match != undefined ? (match.market_fee != undefined ? match.market_fee : 0) : 0) -
          (match != undefined ? (match.royalty_fee != undefined ? match.royalty_fee : 0) : 0) -
          (tx.price != undefined ? tx.price : 0) -
          (type_wth_gas_cost.includes(tx.type) ? (tx.gas != undefined ? tx.gas : 0) : 0),
        // TODO notes: store.notes.find(n => n.noteId == `${tx.tx_hash}_${tx.token_ID}`)?.entry,
        contract: tx.contract,
      };
      count++;
      trades.push(trade);
    }
    else if(tx.type == tx_type.LISTING){
      listings.push(tx);
    }
    else if(tx.type == tx_type.FAILURE){
      failures.push(tx);
    }
    else if(tx.type == tx_type.CANCELLED){
      cancels.push(tx);
    }
    else if(tx.type == tx_type.OPENSEA_EXPENSE){
      opensea_expenses.push(tx);
    }
  });
  const endTime = performance.now();
  console.log(`Parse Trades took ${endTime - startTime} milliseconds`);
  // store.setListings(listings);
  // store.setFailures(failures);
  // store.setCancels(cancels);
  // store.setOpenseaExpenses(opensea_expenses);
  return trades;
}