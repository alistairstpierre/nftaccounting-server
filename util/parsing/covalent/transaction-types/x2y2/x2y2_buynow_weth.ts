import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_x2y2_buynow_weth_transaction(item: CovalentItem): Transaction {
  const purchaser = item.log_events[4]?.decoded?.params[1]?.value.toString().toLowerCase();
  const seller = item.log_events[4]?.decoded?.params[0]?.value.toString().toLowerCase();
  let type = purchaser == global.walletAddress ? tx_type.X2Y2_BUYNOW_PURCHASE : tx_type.X2Y2_BUYNOW_SALE;
  if (type == tx_type.X2Y2_BUYNOW_SALE && seller != global.walletAddress) {
    type = tx_type.ERROR;
  }

  let id: string | undefined = undefined;
  if (item.log_events[4] != undefined) id = item.log_events[4].decoded?.params.find((i) => i.name == "tokenId")?.value;

  let price: string | undefined | boolean = undefined;
  if (item.log_events[6] != undefined) price = item.log_events[6].decoded?.params.find((i) => i.name == "price")?.value;

  return create_transaction(
    type,
    item.tx_hash,
    item.block_signed_at,
    typeof item.fees_paid == "string" ? parseInt(item.fees_paid) : item.fees_paid,
    price != undefined && typeof price == "string" ? parseInt(price) : undefined,
    item.log_events[4]?.sender_name,
    item.log_events[4]?.sender_address,
    id,
    exchange.X2Y2
  );
}
