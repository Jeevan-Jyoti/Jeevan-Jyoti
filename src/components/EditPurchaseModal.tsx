"use client";

import { useMedicineStore } from "@/lib/stores/medicineStore";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MedicineEntry {
  name: string;
  category: string;
  quantity: string;
  price: number;
}

interface Purchase {
  _id: string;
  customerName: string;
  medicines: {
    name: string;
    category: string;
    quantity: number;
    price: number;
  }[];
  discount: number;
  totalPrice: number;
  dueAmount: number;
  paymentMode: "cash" | "online";
  date: string;
}

interface EditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onUpdate: () => void;
}

export default function EditPurchaseModal({
  isOpen,
  onClose,
  purchase,
  onUpdate,
}: EditPurchaseModalProps) {
  const { medicines, fetchAllMedicines } = useMedicineStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState("");
  const [medicineList, setMedicineList] = useState<MedicineEntry[]>([]);
  const [currentMed, setCurrentMed] = useState<MedicineEntry>({
    name: "",
    quantity: "",
    price: 0,
    category: "",
  });
  const [discount, setDiscount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [dueAmount, setDueAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAllMedicines();
    }
  }, [isOpen, fetchAllMedicines]);

  useEffect(() => {
    if (purchase) {
      setCustomerName(purchase.customerName);
      setMedicineList(
        purchase.medicines.map((m) => ({
          name: m.name,
          quantity: m.quantity.toString(),
          price: m.price,
          category: m.category,
        }))
      );
      setDiscount(purchase.discount.toString());
      setDueAmount(purchase.dueAmount.toString());
      setPaymentMode(purchase.paymentMode);
      setStep(1);
      setCurrentMed({ name: "", quantity: "", price: 0, category: "" });
    }
  }, [purchase]);

  useEffect(() => {
    const match = medicines.find((m) => m.name === currentMed.name);
    if (match) {
      setCurrentMed((prev) => ({
        ...prev,
        category: match.category,
        price: match.price,
      }));
    } else {
      setCurrentMed((prev) => ({
        ...prev,
        category: "",
        price: 0,
      }));
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

  const handleAddMedicine = () => {
    if (
      !currentMed.name ||
      currentMed.quantity.trim() === "" ||
      isNaN(parseInt(currentMed.quantity)) ||
      parseInt(currentMed.quantity) <= 0
    )
      return;

    setMedicineList([...medicineList, currentMed]);
    setCurrentMed({ name: "", quantity: "", price: 0, category: "" });
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicineList(medicineList.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!purchase) return;

    const nowIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    const updated: Purchase & { date: string } = {
      ...purchase,
      customerName,
      medicines: medicineList.map((m) => ({
        name: m.name,
        category: m.category,
        quantity: parseInt(m.quantity),
        price: m.price,
      })),
      discount: parseFloat(discount) || 0,
      totalPrice,
      paymentMode,
      dueAmount: parseFloat(dueAmount) || 0,
      date: nowIST,
    };

    try {
      await axios.put(`/api/purchases/${purchase._id}`, updated);
      toast.success("Purchase updated");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Failed to update purchase");
      console.error(err);
    }
  };

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-red-500 cursor-pointer"
          aria-label="Close"
          title="Close"
        >
          <X />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold">Edit Purchase - Step 1</h2>

              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
              />

              <div className="border p-4 rounded bg-gray-50 space-y-2">
                <h3 className="font-medium text-gray-700">Add Medicine</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="relative col-span-1">
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      placeholder="Medicine name"
                      value={currentMed.name}
                      onChange={(e) =>
                        setCurrentMed({ ...currentMed, name: e.target.value })
                      }
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute bg-white border z-50 rounded mt-1 max-h-32 overflow-y-auto text-sm shadow w-full">
                        {suggestions.slice(0, 5).map((m, idx) => (
                          <li
                            key={idx}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() =>
                              setCurrentMed({
                                name: m.name,
                                quantity: "",
                                price: m.price,
                                category: m.category,
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
                    placeholder="Quantity"
                    className="border px-3 py-2 rounded"
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
                    className="border px-3 py-2 rounded bg-gray-200"
                    placeholder="Price"
                    value={currentMed.price.toFixed(2)}
                    disabled
                  />
                </div>

                <button
                  onClick={handleAddMedicine}
                  className="mt-2 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm cursor-pointer"
                >
                  Add Medicine
                </button>
              </div>

              {medicineList.length > 0 && (
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  {medicineList.map((m, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>
                        {m.name} ({m.category}) - {m.quantity} × ₹
                        {m.price.toFixed(2)} = ₹
                        {(parseInt(m.quantity) * m.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveMedicine(i)}
                        className="text-red-600 hover:underline text-xs ml-3 cursor-pointer"
                        aria-label={`Remove ${m.name}`}
                        title={`Remove ${m.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold">Finalize Edit</h2>

              <p className="text-gray-700">
                <strong>Total:</strong> ₹{totalPrice.toFixed(2)}
              </p>

              <input
                type="number"
                placeholder="Discount"
                className="w-full border px-3 py-2 rounded"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />

              <select
                className="w-full border px-3 py-2 rounded"
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
                placeholder="Due Amount"
                className="w-full border px-3 py-2 rounded"
                value={dueAmount}
                onChange={(e) => setDueAmount(e.target.value)}
              />

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded border hover:bg-gray-100 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
