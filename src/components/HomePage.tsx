"use client";

import { useAddPurchaseModal } from "@/lib/modalStore";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { format, isAfter, isToday } from "date-fns";
import { PencilLine, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PurchasedMedicine {
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface Purchase {
  _id: string;
  customerName: string;
  date: string;
  medicines: PurchasedMedicine[];
  totalPrice: number;
  discount: number;
  dueAmount: number;
  paymentMode: "cash" | "online";
}

export default function HomePage() {
  const { user } = useUser();
  const { open } = useAddPurchaseModal();
  const isAdmin = user?.username === "abhay";

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(
        "/api/purchases?date=" + selectedDate.toISOString()
      );
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchases");
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [selectedDate]);

  const today = new Date();
  const isTodaySelected = isToday(selectedDate);
  const maxDate = format(today, "yyyy-MM-dd");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Purchases on {format(selectedDate, "dd MMM yyyy")}
        </h1>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          max={maxDate}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            if (!isAfter(newDate, today)) {
              setSelectedDate(newDate);
            }
          }}
          className="border px-3 py-1.5 rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {purchases.map((purchase) => (
          <div
            key={purchase._id}
            className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {purchase.customerName}
              </h2>
              {isAdmin && (
                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                  <PencilLine className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Payment: {purchase.paymentMode}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Discount: ₹{purchase.discount}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Total: ₹{purchase.totalPrice}
            </p>
            <p
              className={`text-sm font-semibold ${
                purchase.dueAmount > 0 ? "text-red-600" : "text-green-700"
              }`}
            >
              Due: ₹{purchase.dueAmount}
            </p>
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Medicines:
              </h3>
              <ul className="pl-4 list-disc text-sm text-gray-600">
                {purchase.medicines.map((med, idx) => (
                  <li key={idx}>
                    {med.name} ({med.category}) - {med.quantity} x ₹{med.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {isTodaySelected && (
          <div
            onClick={open}
            className="flex items-center justify-center border-2 border-dashed border-green-500 rounded-xl p-4 text-green-600 hover:bg-green-50 hover:cursor-pointer transition"
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Add Purchase</span>
          </div>
        )}
      </div>
    </div>
  );
}
