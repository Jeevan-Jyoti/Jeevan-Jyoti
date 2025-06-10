"use client";

import EditPurchaseModal from "@/components/EditPurchaseModal";
import { useAddPurchaseModal } from "@/lib/modalStore";
import { Purchase, usePurchaseStore } from "@/lib/stores/purchaseStore";
import { useUser } from "@clerk/nextjs";
import { format, isAfter, isToday, parseISO } from "date-fns";
import { PencilLine, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const { user } = useUser();
  const { open: openAddPurchase } = useAddPurchaseModal();
  const isAdmin = user?.username === "abhay";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);

  const { purchases, fetchAllPurchases } = usePurchaseStore();

  const today = new Date();
  const isTodaySelected = isToday(selectedDate);
  const maxDate = format(today, "yyyy-MM-dd");

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        await fetchAllPurchases();
      } catch (err) {
        console.error(err);
        toast.error("Failed to load purchases");
      }
    };
    loadPurchases();
  }, []);

  const filteredPurchases = purchases.filter(
    (p) =>
      format(parseISO(p.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd"),
  );

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (a.dueAmount > 0 && b.dueAmount === 0) return -1;
    if (a.dueAmount === 0 && b.dueAmount > 0) return 1;
    return (
      new Date(parseISO(b.date)).getTime() -
      new Date(parseISO(a.date)).getTime()
    );
  });

  const totalAmountForDay =
    sortedPurchases.reduce((sum, p) => sum + p.totalPrice, 0) -
    sortedPurchases.reduce((sum, p) => sum + p.discount, 0);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
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
          className="rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedPurchases.map((purchase) => {
          const hasDue = purchase.dueAmount > 0;
          return (
            <div
              key={purchase._id}
              className={`rounded-xl border p-4 shadow-sm transition ${
                hasDue ? "border-red-300 bg-red-50" : "bg-white hover:shadow-md"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
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
                    className="flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>
              <p className="mb-1 text-sm text-gray-600">
                Payment: {purchase.paymentMode}
              </p>
              <p className="mb-1 text-sm text-gray-600">
                Subtotal: ₹{purchase.totalPrice.toFixed(2)}
              </p>
              <p className="mb-1 text-sm text-gray-600">
                Discount: ₹{purchase.discount}
              </p>
              <p className="mb-1 text-sm text-gray-600">
                Final Price: ₹
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
                <h3 className="mb-1 text-sm font-medium text-gray-700">
                  Medicines:
                </h3>
                <ul className="list-disc pl-4 text-sm text-gray-600">
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
            className="flex items-center justify-center rounded-xl border-2 border-dashed border-green-500 p-4 text-green-600 transition hover:cursor-pointer hover:bg-green-50"
          >
            <PlusCircle className="mr-1 h-5 w-5" />
            <span className="text-sm font-medium">Add Purchase</span>
          </div>
        )}
      </div>
      {sortedPurchases.length > 0 && (
        <div className="mt-6 text-right text-xl font-semibold text-gray-800">
          Total Purchase: ₹{totalAmountForDay.toFixed(2)}
        </div>
      )}
      <EditPurchaseModal
        isOpen={!!editPurchase}
        onClose={() => setEditPurchase(null)}
        purchase={editPurchase}
        onUpdate={fetchAllPurchases}
      />
    </div>
  );
}
