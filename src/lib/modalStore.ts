import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

interface EditPurchaseModalState {
  isOpen: boolean;
  purchaseId: string | null;
  open: (purchaseId: string) => void;
  close: () => void;
}

export const useAddMedicineModal = create<ModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useAddPurchaseModal = create<ModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useEditPurchaseModal = create<EditPurchaseModalState>((set) => ({
  isOpen: false,
  purchaseId: null,
  open: (purchaseId) => set({ isOpen: true, purchaseId }),
  close: () => set({ isOpen: false, purchaseId: null }),
}));
