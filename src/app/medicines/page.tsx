"use client";

import { useAddMedicineModal } from "@/lib/modalStore";
import { useMedicineStore } from "@/lib/stores/medicineStore";
import { Medicine } from "@/types/medicine";
import { useUser } from "@clerk/nextjs";
import { ArrowDown01, ArrowDownAZ } from "lucide-react";
import { useMemo, useState } from "react";

export default function MedicinesPage() {
  const { user } = useUser();
  const isAdmin = user?.username === "abhay";
  const { medicines } = useMedicineStore();
  const { open } = useAddMedicineModal();

  const [sortBy, setSortBy] = useState<"alphabetic" | "quantity">("alphabetic");

  const sorted = useMemo(() => {
    const sortedMeds = [...medicines];
    if (sortBy === "alphabetic") {
      return sortedMeds.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return sortedMeds.sort((a, b) => a.quantity - b.quantity);
    }
  }, [medicines, sortBy]);

  const isLowStock = (med: Medicine) => {
    const category = med.category.toLowerCase();
    if (category === "tablet" && med.quantity < 20) return true;
    if (category === "syrup" && med.quantity < 3) return true;
    if (category === "injection" && med.quantity < 3) return true;
    if (category === "capsule" && med.quantity < 20) return true;
    if (category === "ointment" && med.quantity < 3) return true;
    if (category === "ivf" && med.quantity < 10) return true;
    if (med.quantity <= 2) return true;

    return false;
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-800">
          All Medicines
        </h1>
        <div className="flex justify-start">
          <button
            onClick={() =>
              setSortBy((prev) =>
                prev === "alphabetic" ? "quantity" : "alphabetic",
              )
            }
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            {sortBy === "alphabetic" ? (
              <>
                <ArrowDownAZ className="h-4 w-4" />
                Alphabetic
              </>
            ) : (
              <>
                <ArrowDown01 className="h-4 w-4" />
                Quantity
              </>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[450px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sorted.map((med, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 shadow transition duration-200 hover:shadow-lg ${
              isLowStock(med)
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <h2 className="text-lg font-semibold text-gray-800">{med.name}</h2>
            <p className="text-sm text-gray-600">Category: {med.category}</p>
            <p className="text-sm text-gray-600">Price: ₹{med.price}</p>
            <p
              className={`mt-1 text-sm font-semibold ${
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
            className="flex items-center justify-center rounded-xl border-2 border-dashed border-green-500 p-4 text-green-600 transition hover:cursor-pointer hover:bg-green-50"
          >
            <span className="text-lg font-medium">＋ Add</span>
          </div>
        )}
      </div>
    </div>
  );
}
