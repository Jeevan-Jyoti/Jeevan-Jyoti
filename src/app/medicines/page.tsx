"use client";

import AddMedicineModal from "@/components/AddMedicineModal";
import { useAddMedicineModal } from "@/lib/modalStore";
import { useMedicineStore } from "@/lib/stores/medicineStore";
import { Medicine } from "@/types/medicine";
import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";

export default function MedicinesPage() {
  const { user } = useUser();
  const isAdmin = user?.username === "abhay";
  const { medicines } = useMedicineStore();
  const { open } = useAddMedicineModal();

  const sorted = useMemo(() => {
    return [...medicines].sort((a, b) => a.name.localeCompare(b.name));
  }, [medicines]);

  const isLowStock = (med: Medicine) => {
    const category = med.category.toLowerCase();
    if (category === "tablet" && med.quantity < 10) return true;
    if (category === "syrup" && med.quantity < 5) return true;
    if (category === "injection" && med.quantity < 5) return true;
    if (category === "capsule" && med.quantity < 10) return true;
    if (category === "ointment" && med.quantity < 3) return true;
    return false;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">All Medicines</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sorted.map((med, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 shadow border transition duration-200 hover:shadow-lg ${
              isLowStock(med)
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <h2 className="text-lg font-semibold text-gray-800">{med.name}</h2>
            <p className="text-sm text-gray-600">Category: {med.category}</p>
            <p className="text-sm text-gray-600">Price: ₹{med.price}</p>
            <p
              className={`text-sm font-semibold mt-1 ${
                isLowStock(med) ? "text-red-600" : "text-green-700"
              }`}
            >
              Quantity: {med.quantity}
            </p>
          </div>
        ))}

        {isAdmin && (
          <div
            onClick={open}
            className="flex items-center justify-center border-2 border-dashed border-green-500 rounded-xl p-4 text-green-600 hover:bg-green-50 hover:cursor-pointer transition"
          >
            <span className="text-lg font-medium">＋ Add</span>
          </div>
        )}
      </div>
    </div>
  );
}
