import { Customer } from "@/lib/models/customer";
import { Medicine } from "@/lib/models/medicine";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: purchaseId } = await params;

    const {
      customerName,
      medicines: newMedicines,
      discount,
      paymentMode,
      dueAmount,
      totalPrice,
    } = await req.json();

    const existingPurchase = await Customer.findById(purchaseId);
    if (!existingPurchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    for (const oldItem of existingPurchase.medicines) {
      const med = await Medicine.findOne({ name: oldItem.name });
      if (med) {
        med.quantity += oldItem.quantity;
        await med.save();
      }
    }

    for (const newItem of newMedicines) {
      const med = await Medicine.findOne({ name: newItem.name });
      if (!med) {
        return NextResponse.json(
          { error: `Medicine ${newItem.name} not found` },
          { status: 404 }
        );
      }
      if (med.quantity < newItem.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for ${newItem.name}. Available: ${med.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    for (const newItem of newMedicines) {
      const med = await Medicine.findOne({ name: newItem.name });
      if (med) {
        med.quantity -= newItem.quantity;
        await med.save();
      }
    }

    existingPurchase.customerName = customerName;
    existingPurchase.medicines = newMedicines;
    existingPurchase.discount = discount;
    existingPurchase.totalPrice = totalPrice;
    existingPurchase.paymentMode = paymentMode;
    existingPurchase.dueAmount = dueAmount;

    await existingPurchase.save();

    return NextResponse.json({ message: "Purchase updated successfully." });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
