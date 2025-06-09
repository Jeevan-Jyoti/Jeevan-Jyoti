"use client";

import EditPurchaseModal from "@/components/EditPurchaseModal";
import { useAddPurchaseModal } from "@/lib/modalStore";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { format, isAfter, isToday, parseISO } from "date-fns";
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
  const { open: openAddPurchase } = useAddPurchaseModal();
  const isAdmin = user?.username === "abhay";

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);

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

  const totalAmountForDay =
    purchases.reduce((sum, p) => sum + p.totalPrice, 0) -
    purchases.reduce((sum, p) => sum + p.discount, 0);

  const sortedPurchases = [...purchases].sort((a, b) => {
    if (a.dueAmount > 0 && b.dueAmount === 0) return -1;
    if (a.dueAmount === 0 && b.dueAmount > 0) return 1;

    return (
      new Date(parseISO(b.date)).getTime() -
      new Date(parseISO(a.date)).getTime()
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Purchases on {format(selectedDate, "dd MMM yyyy")}
        </h1>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          max={maxDate}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            if (!isAfter(newDate, today) || isToday(newDate)) {
              setSelectedDate(newDate);
            }
          }}
          className="border px-3 py-1.5 rounded-lg text-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPurchases.map((purchase) => {
          const hasDue = purchase.dueAmount > 0;
          return (
            <div
              key={purchase._id}
              className={`border rounded-xl p-4 shadow-sm transition ${
                hasDue ? "bg-red-50 border-red-300" : "bg-white hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2
                    className={`text-lg font-semibold ${
                      hasDue ? "text-red-700" : "text-gray-800"
                    }`}
                  >
                    {purchase.customerName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(purchase.date), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setEditPurchase(purchase)}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PencilLine className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Payment: {purchase.paymentMode}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Total: ₹{purchase.totalPrice}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Discount: ₹{purchase.discount}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Amount Paid: ₹
                {(purchase.totalPrice - purchase.discount).toFixed(2)}
              </p>
              <p
                className={`text-sm font-semibold ${
                  hasDue ? "text-red-600" : "text-green-700"
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
                      {med.name} ({med.category}) - {med.quantity} x ₹
                      {med.price}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        {isTodaySelected && (
          <div
            onClick={openAddPurchase}
            className="flex items-center justify-center border-2 border-dashed border-green-500 rounded-xl p-4 text-green-600 hover:bg-green-50 hover:cursor-pointer transition"
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Add Purchase</span>
          </div>
        )}
      </div>
      {purchases.length > 0 && (
        <div className="mt-6 text-xl font-semibold text-gray-800 text-right">
          Total Purchase: ₹{totalAmountForDay.toFixed(2)}
        </div>
      )}
      <EditPurchaseModal
        isOpen={!!editPurchase}
        onClose={() => setEditPurchase(null)}
        purchase={editPurchase}
        onUpdate={fetchPurchases}
      />
    </div>
  );
}
