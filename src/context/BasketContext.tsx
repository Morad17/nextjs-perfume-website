"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { BasketAction, BasketItem, BasketState } from "@/types/basket";

const STORAGE_KEY = "maison-basket";

function basketReducer(state: BasketState, action: BasketAction): BasketState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.payload.productId &&
            i.size === action.payload.size
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
          isDrawerOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        isDrawerOpen: true,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.payload.productId &&
              i.size === action.payload.size
            )
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };

    case "CLEAR_BASKET":
      return { ...state, items: [] };

    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };

    default:
      return state;
  }
}

interface BasketContextValue extends BasketState {
  totalItems: number;
  totalPrice: number;
  addItem: (item: BasketItem) => void;
  removeItem: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearBasket: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, {
    items: [],
    isDrawerOpen: false,
  });

  // Rehydrate from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "HYDRATE", payload: JSON.parse(stored) });
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback(
    (item: BasketItem) => dispatch({ type: "ADD_ITEM", payload: item }),
    []
  );
  const removeItem = useCallback(
    (productId: string, size: number) =>
      dispatch({ type: "REMOVE_ITEM", payload: { productId, size } }),
    []
  );
  const updateQuantity = useCallback(
    (productId: string, size: number, quantity: number) =>
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, size, quantity },
      }),
    []
  );
  const clearBasket = useCallback(
    () => dispatch({ type: "CLEAR_BASKET" }),
    []
  );
  const openDrawer = useCallback(
    () => dispatch({ type: "OPEN_DRAWER" }),
    []
  );
  const closeDrawer = useCallback(
    () => dispatch({ type: "CLOSE_DRAWER" }),
    []
  );

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <BasketContext.Provider
      value={{
        ...state,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearBasket,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within BasketProvider");
  return ctx;
}
