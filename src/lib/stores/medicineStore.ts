import axios from "axios";
import { create } from "zustand";

export interface Medicine {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface MedicineStore {
  medicines: Medicine[];
  fetchAllMedicines: () => Promise<void>;
  setMedicines: (data: Medicine[]) => void;
  addOrUpdateMedicine: (newMed: Medicine) => void;
  updateMedicineQuantity: (name: string, change: number) => void;
  resetMedicineStore: () => void;
}

export const useMedicineStore = create<MedicineStore>((set) => ({
  medicines: [],

  fetchAllMedicines: async () => {
    try {
      const res = await axios.get("/api/medicines");
      set({ medicines: res.data });
    } catch (error) {
      console.error("Failed to fetch medicines", error);
    }
  },

  setMedicines: (data) => set({ medicines: data }),

  addOrUpdateMedicine: (newMed) =>
    set((state) => {
      const existingIndex = state.medicines.findIndex(
        (med) => med.name === newMed.name
      );
      const updated = [...state.medicines];
      if (existingIndex !== -1) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...newMed,
        };
      } else {
        updated.push(newMed);
      }
      return { medicines: updated };
    }),

  updateMedicineQuantity: (name, change) =>
    set((state) => {
      const updated = state.medicines.map((med) =>
        med.name === name ? { ...med, quantity: med.quantity + change } : med
      );
      return { medicines: updated };
    }),

  resetMedicineStore: () => set({ medicines: [] }),
}));
