import axios from "axios";
import { create } from "zustand";

interface Medicine {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface MedicineStore {
  medicines: Medicine[];
  fetchMedicines: () => Promise<void>;
  setMedicines: (data: Medicine[]) => void;
  addOrUpdateMedicine: (newMed: Medicine) => void;
}

export const useMedicineStore = create<MedicineStore>((set) => ({
  medicines: [],
  fetchMedicines: async () => {
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
      const updated = [...state.medicines];
      const index = updated.findIndex((med) => med.name === newMed.name);
      if (index !== -1) {
        updated[index] = { ...updated[index], ...newMed };
      } else {
        updated.push(newMed);
      }
      return { medicines: updated };
    }),
}));
