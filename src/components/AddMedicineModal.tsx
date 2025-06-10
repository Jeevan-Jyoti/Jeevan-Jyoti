"use client";

import { useAddMedicineModal } from "@/lib/modalStore";
import { useMedicineStore } from "@/lib/stores/medicineStore";
import { Medicine } from "@/types/medicine";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const categoryList = [
  "Tablet",
  "Injection",
  "Syrup",
  "Capsule",
  "Ointment",
  "Cream",
  "IVF",
  "Bandage",
  "Powder",
  "Drops",
  "Oil",
  "Soap",
  "Others",
];

export default function AddMedicineModal() {
  const { isOpen, close } = useAddMedicineModal();
  const { medicines: allMedicines, addOrUpdateMedicine } = useMedicineStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (name.trim() === "") {
      setSuggestions([]);
    } else {
      setSuggestions(
        allMedicines.filter((m) =>
          m.name.toLowerCase().includes(name.toLowerCase()),
        ),
      );
    }
  }, [name, allMedicines]);

  useEffect(() => {
    if (category.trim() === "") {
      setCategorySuggestions([]);
    } else {
      const filtered = categoryList.filter((cat) =>
        cat.toLowerCase().includes(category.toLowerCase()),
      );
      setCategorySuggestions(filtered);
    }
  }, [category]);

  const handleSuggestionClick = (med: Medicine) => {
    setName(med.name);
    setCategory(med.category);
    setPrice(med.price.toString());

    setTimeout(() => {
      setSuggestions([]);
      setCategorySuggestions([]);
    }, 0);
  };

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);

    setTimeout(() => {
      setCategorySuggestions([]);
      setSuggestions([]);
    }, 0);
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setQuantity("");
    setSuggestions([]);
    setCategorySuggestions([]);
  };

  const isFormValid =
    name.trim() &&
    category.trim() &&
    !isNaN(Number(price)) &&
    Number(price) >= 0 &&
    !isNaN(Number(quantity)) &&
    Number(quantity) >= 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Please fill all fields with valid values.");
      return;
    }

    try {
      setLoading(true);

      const newMed: Medicine = {
        name: name.trim(),
        category: category.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
      };

      await axios.post("/api/medicines", newMed);
      toast.success("Saved successfully");

      addOrUpdateMedicine(newMed);
      resetForm();
      close();
    } catch (err) {
      console.error(err);
      toast.error("Error saving medicine");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative z-50 w-full max-w-md rounded-xl bg-white p-6 shadow">
        <button
          onClick={() => {
            resetForm();
            close();
          }}
          className="absolute top-3 right-3 cursor-pointer text-lg text-gray-600 hover:text-black"
        >
          ✕
        </button>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Add or Update Medicine
        </h2>
        <div className="relative space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg border bg-white shadow">
                {suggestions.map((med, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(med)}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                  >
                    {med.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            {categorySuggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg border bg-white shadow">
                {categorySuggestions.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCategoryClick(cat)}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (₹)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={0}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`w-full rounded-lg py-2 font-semibold text-white transition ${
              !isFormValid || loading
                ? "cursor-not-allowed bg-green-400"
                : "cursor-pointer bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
