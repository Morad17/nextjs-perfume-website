export interface BasketItem {
  productId: string;
  name: string;
  price: number; // price for the selected size, in pence
  imageUrl: string;
  slug: string;
  size: number; // ml
  quantity: number;
}

export interface BasketState {
  items: BasketItem[];
  isDrawerOpen: boolean;
}

export type BasketAction =
  | { type: "ADD_ITEM"; payload: BasketItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: number } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; size: number; quantity: number };
    }
  | { type: "CLEAR_BASKET" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; payload: BasketItem[] };
