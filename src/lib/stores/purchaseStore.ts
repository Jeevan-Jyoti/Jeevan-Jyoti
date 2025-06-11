import axios from "axios";
import { create } from "zustand";

interface PurchasedMedicine {
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface Purchase {
  _id: string;
  customerName: string;
  date: string;
  medicines: PurchasedMedicine[];
  totalPrice: number;
  discount: number;
  dueAmount: number;
  paymentMode: "cash" | "online";
}

interface PurchaseStore {
  purchases: Purchase[];
  fetchAllPurchases: (date?: string) => Promise<void>;
  setPurchases: (data: Purchase[]) => void;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  purchases: [],

  fetchAllPurchases: async (date?: string) => {
    try {
      const url = date ? `/api/purchases?date=${date}` : "/api/purchases";
      const res = await axios.get(url);
      set({ purchases: res.data });
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    }
  },

  setPurchases: (data) => set({ purchases: data }),
}));
