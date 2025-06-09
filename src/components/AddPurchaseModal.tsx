"use client";

import { useAddPurchaseModal } from "@/lib/modalStore";
import { useMedicineStore } from "@/lib/stores/medicineStore";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MedicineEntry = {
  name: string;
  category: string;
  quantity: string;
  price: number;
};

export default function AddPurchaseModal() {
  const { isOpen, close } = useAddPurchaseModal();
  const { medicines, fetchAllMedicines } = useMedicineStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState("");
  const [medicineList, setMedicineList] = useState<MedicineEntry[]>([]);
  const [discount, setDiscount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [dueAmount, setDueAmount] = useState("");

  const [currentMed, setCurrentMed] = useState({
    name: "",
    quantity: "",
    price: 0,
    category: "",
  });

  useEffect(() => {
    if (isOpen) fetchAllMedicines();
  }, [isOpen, fetchAllMedicines]);

  useEffect(() => {
    const matched = medicines.find((m) => m.name === currentMed.name);
    if (matched) {
      setCurrentMed((prev) => ({
        ...prev,
        category: matched.category,
        price: matched.price,
      }));
    } else {
      setCurrentMed((prev) => ({ ...prev, category: "", price: 0 }));
    }
  }, [currentMed.name, medicines]);

  const suggestions =
    currentMed.name && !medicines.some((m) => m.name === currentMed.name)
      ? medicines.filter((m) =>
          m.name.toLowerCase().includes(currentMed.name.toLowerCase())
        )
      : [];

  const totalPrice = medicineList.reduce((sum, m) => {
    const qty = parseInt(m.quantity) || 0;
    return sum + qty * m.price;
  }, 0);

  const resetForm = () => {
    setStep(1);
    setCustomerName("");
    setMedicineList([]);
    setCurrentMed({ name: "", quantity: "", price: 0, category: "" });
    setDiscount("");
    setPaymentMode("cash");
    setDueAmount("");
  };

  const handleAddMedicine = () => {
    if (
      !currentMed.name ||
      currentMed.quantity.trim() === "" ||
      isNaN(parseInt(currentMed.quantity)) ||
      parseInt(currentMed.quantity) <= 0 ||
      currentMed.price < 0
    )
      return;

    setMedicineList((prev) => [
      ...prev,
      {
        name: currentMed.name,
        category: currentMed.category,
        quantity: currentMed.quantity,
        price: currentMed.price,
      },
    ]);

    setCurrentMed({ name: "", quantity: "", price: 0, category: "" });
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicineList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const discountNum = parseFloat(discount) || 0;
    const dueAmountNum = parseFloat(dueAmount) || 0;

    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const purchase = {
      customerName,
      date: nowIST,
      medicines: medicineList.map((m) => ({
        name: m.name,
        category: m.category,
        quantity: parseInt(m.quantity),
        price: parseFloat(m.price.toFixed(2)),
      })),
      totalPrice,
      discount: discountNum,
      paymentMode,
      dueAmount: dueAmountNum,
    };

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchase),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Error: " + err.error);
        return;
      }

      toast.success("Saved successfully");
      await fetchAllMedicines();
      resetForm();
      close();
    } catch (e) {
      console.error("Error submitting purchase:", e);
      toast.error("Something went wrong.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-red-500 cursor-pointer"
          onClick={() => {
            close();
            resetForm();
          }}
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">New Purchase - Step 1</h2>

              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <div className="border p-4 rounded bg-gray-50 space-y-2">
                <h3 className="font-medium text-gray-700">Add Medicine</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="relative col-span-1">
                    <input
                      type="text"
                      className="border px-3 py-2 rounded w-full"
                      placeholder="Medicine name"
                      value={currentMed.name}
                      onChange={(e) =>
                        setCurrentMed({ ...currentMed, name: e.target.value })
                      }
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-50 bg-white border mt-1 rounded text-sm max-h-28 overflow-y-auto shadow-lg w-full">
                        {suggestions.slice(0, 5).map((m, idx) => (
                          <li
                            key={idx}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() =>
                              setCurrentMed({
                                ...currentMed,
                                name: m.name,
                                quantity: "",
                              })
                            }
                          >
                            {m.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <input
                    type="text"
                    className="border px-3 py-2 rounded"
                    placeholder="Quantity"
                    value={currentMed.quantity}
                    onChange={(e) =>
                      setCurrentMed({
                        ...currentMed,
                        quantity: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    className="border px-3 py-2 rounded bg-gray-200 cursor-not-allowed"
                    placeholder="Price"
                    value={currentMed.price.toFixed(2)}
                    disabled
                  />
                </div>

                <button
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded mt-2 hover:bg-green-700 cursor-pointer"
                  onClick={handleAddMedicine}
                >
                  Add Medicine
                </button>
              </div>

              {medicineList.length > 0 && (
                <div className="text-sm text-gray-700">
                  <h4 className="font-medium mt-3">Medicines Added:</h4>
                  <ul className="mt-1 space-y-1">
                    {medicineList.map((med, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between border p-2 rounded"
                      >
                        <span>
                          {med.name} ({med.category}) - {med.quantity} × ₹
                          {med.price.toFixed(2)} = ₹
                          {(parseInt(med.quantity) * med.price).toFixed(2)}
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                          onClick={() => handleRemoveMedicine(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">
                Finalize Purchase - Step 2
              </h2>

              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Discount (₹)"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />

              <select
                className="w-full border rounded px-3 py-2"
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(e.target.value as "cash" | "online")
                }
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>

              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Due Amount (₹)"
                value={dueAmount}
                onChange={(e) => setDueAmount(e.target.value)}
              />

              <p className="text-gray-700 text-sm">
                <strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}
              </p>

              <p className="text-red-500 text-sm">
                <strong>Discount:</strong> ₹{discount}
              </p>

              <p className="text-gray-700 text-sm">
                <strong>Final Price:</strong> ₹
                {(totalPrice - parseFloat(discount)).toFixed(2)}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>

                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
