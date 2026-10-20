import { sameKey } from "./ids";
import type { Order } from "./types";

export function canView(order: Order | null, key: string | null | undefined): order is Order {
  return Boolean(order && key && sameKey(order.key, key));
}
