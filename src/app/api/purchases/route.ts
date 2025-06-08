import { Customer } from "@/lib/models/customer";
import { Medicine } from "@/lib/models/medicine";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const dateParam = req.nextUrl.searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const purchases = await Customer.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases", details: error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { customerName, medicines, discount, paymentMode, dueAmount } =
      await req.json();

    let totalPrice = 0;
    for (const item of medicines) {
      totalPrice += item.price * item.quantity;
    }

    for (const item of medicines) {
      const med = await Medicine.findOne({ name: item.name });
      if (!med) {
        return NextResponse.json(
          { error: `Medicine ${item.name} not found` },
          { status: 404 }
        );
      }

      if (med.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for ${item.name}. Available: ${med.quantity}`,
          },
          { status: 400 }
        );
      }

      med.quantity -= item.quantity;
      await med.save();
    }

    const customer = await Customer.create({
      customerName,
      medicines,
      totalPrice,
      discount,
      paymentMode,
      dueAmount,
      date: new Date(),
    });

    return NextResponse.json({ message: "Purchase added", data: customer });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
