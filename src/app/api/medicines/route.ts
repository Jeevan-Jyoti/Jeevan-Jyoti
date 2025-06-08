import { Medicine } from "@/lib/models/medicine";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const meds = await Medicine.find({});
  return NextResponse.json(meds);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, category, price, quantity } = body;

    if (!name || !category || price == null || quantity == null) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const existing = await Medicine.findOne({ name });

    if (existing) {
      existing.price = price;
      existing.quantity += quantity;
      await existing.save();
      return NextResponse.json({
        message: "Updated existing medicine",
        medicine: existing,
      });
    } else {
      const newMed = await Medicine.create({ name, category, price, quantity });
      return NextResponse.json({
        message: "Created new medicine",
        medicine: newMed,
      });
    }
  } catch (error) {
    console.error("Error in POST /api/medicine:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
