"use client";

import { useAddPurchaseModal } from "@/lib/modalStore";
import { useMedicineStore } from "@/lib/stores/medicineStore";
import { usePurchaseStore } from "@/lib/stores/purchaseStore";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const { fetchAllPurchases } = usePurchaseStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState("");
  const [medicineList, setMedicineList] = useState<MedicineEntry[]>([]);
  const [discount, setDiscount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [dueAmount, setDueAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentMed, setCurrentMed] = useState({
    name: "",
    quantity: "",
    price: 0,
    category: "",
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
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
          m.name.toLowerCase().includes(currentMed.name.toLowerCase()),
        )
      : [];

  const totalPrice = medicineList.reduce((sum, m) => {
    const qty = parseInt(m.quantity) || 0;
    return sum + qty * m.price;
  }, 0);

  const discountAmount = parseFloat(discount) || 0;
  const finalAmount = totalPrice - discountAmount;

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
      currentMed.quantity.trim() === "" &&
      currentMed.name !== "" &&
      currentMed.price > 0
    ) {
      const isDuplicate = medicineList.some((m) => m.name === currentMed.name);
      if (isDuplicate) {
        toast.warning("Medicine already added");
        return;
      }
      setMedicineList((prev) => [
        ...prev,
        {
          name: currentMed.name,
          category: currentMed.category,
          quantity: "1",
          price: currentMed.price,
        },
      ]);
      setCurrentMed({ name: "", quantity: "", price: 0, category: "" });
      return;
    }
    if (
      !currentMed.name ||
      isNaN(parseInt(currentMed.quantity)) ||
      parseInt(currentMed.quantity) <= 0 ||
      currentMed.price <= 0
    )
      return;

    const isDuplicate = medicineList.some((m) => m.name === currentMed.name);
    if (isDuplicate) {
      toast.warning("Medicine already added");
      return;
    }

    setMedicineList((prev) => [
      ...prev,
      {
        name: currentMed.name,
        category: currentMed.category,
        quantity: parseInt(currentMed.quantity) ? currentMed.quantity : "1",
        price: currentMed.price,
      },
    ]);

    setCurrentMed({ name: "", quantity: "", price: 0, category: "" });
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicineList((prev) => prev.filter((_, i) => i !== index));
  };

  const hasUnsavedData = customerName || medicineList.length > 0;

  const handleClose = () => {
    if (hasUnsavedData && !confirm("Are you sure you want to discard changes?"))
      return;
    resetForm();
    close();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const discountNum = parseFloat(discount) || 0;
    const dueAmountNum = parseFloat(dueAmount) || 0;

    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
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
      await fetchAllPurchases();
      resetForm();
      setIsLoading(false);
      close();
    } catch (e) {
      setIsLoading(false);
      console.error("Error submitting purchase:", e);
      toast.error("Something went wrong.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6">
        <button
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-red-500"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
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
                ref={nameInputRef}
                className="w-full rounded border px-3 py-2"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <div className="space-y-2 rounded border bg-gray-50 p-4">
                <h3 className="font-medium text-gray-700">Add Medicine</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="relative col-span-1">
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      placeholder="Medicine name"
                      value={currentMed.name}
                      onChange={(e) =>
                        setCurrentMed({ ...currentMed, name: e.target.value })
                      }
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-50 mt-1 max-h-28 w-full overflow-y-auto rounded border bg-white text-sm shadow-lg">
                        {suggestions.slice(0, 5).map((m, idx) => (
                          <li
                            key={idx}
                            className="cursor-pointer px-3 py-1 hover:bg-gray-100"
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
                    className="rounded border px-3 py-2"
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
                    className="cursor-not-allowed rounded border bg-gray-200 px-3 py-2"
                    placeholder="Price"
                    value={currentMed.price.toFixed(2)}
                    disabled
                  />
                </div>

                <button
                  className="mt-2 cursor-pointer rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  onClick={handleAddMedicine}
                >
                  Add Medicine
                </button>
              </div>

              {medicineList.length > 0 && (
                <div className="text-sm text-gray-700">
                  <h4 className="mt-3 font-medium">Medicines Added:</h4>
                  <ul className="mt-1 space-y-1">
                    {medicineList.map((med, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <span>
                          {med.name} ({med.category}) - {med.quantity} × ₹
                          {med.price.toFixed(2)} = ₹
                          {(parseInt(med.quantity) * med.price).toFixed(2)}
                        </span>
                        <button
                          className="ml-2 cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveMedicine(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className={`cursor-pointer rounded px-4 py-2 text-white ${
                  medicineList.length === 0 || customerName === ""
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={medicineList.length === 0 || customerName === ""}
                onClick={() => setStep(2)}
              >
                Next
              </button>
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
                className="w-full rounded border px-3 py-2"
                placeholder="Discount (₹)"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />

              <select
                className="w-full rounded border px-3 py-2"
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
                className="w-full rounded border px-3 py-2"
                placeholder="Due amount after payment (₹)"
                value={dueAmount}
                onChange={(e) => setDueAmount(e.target.value)}
              />

              <p className="text-gray-700">
                <strong>Subtotal:</strong> ₹{totalPrice.toFixed(2)}
              </p>
              <p className="text-gray-700">
                <strong>Discount:</strong> ₹{discountAmount.toFixed(2)}
              </p>
              <p className="text-lg font-semibold text-green-700">
                <strong>Total After Discount:</strong> ₹{finalAmount.toFixed(2)}
              </p>

              <div className="mt-4 flex justify-between">
                <button
                  className="cursor-pointer rounded border border-gray-400 px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>

                <button
                  disabled={isLoading}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded px-4 py-2 text-white ${
                    isLoading
                      ? "bg-green-300"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-t-2 border-white" />
                  ) : null}
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
