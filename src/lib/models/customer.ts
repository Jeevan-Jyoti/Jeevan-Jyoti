import mongoose, { Document, models, Schema } from "mongoose";

export interface PurchasedMedicine {
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface CustomerDocument extends Document {
  customerName: string;
  date: Date;
  medicines: PurchasedMedicine[];
  totalPrice: number;
  discount: number;
  paymentMode: "cash" | "online";
  dueAmount: number;
}

const PurchasedMedicineSchema = new Schema<PurchasedMedicine>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const CustomerSchema = new Schema<CustomerDocument>(
  {
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    medicines: { type: [PurchasedMedicineSchema], required: true },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["cash", "online"],
      required: true,
    },
    dueAmount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Customer =
  models.Customer ||
  mongoose.model<CustomerDocument>("Customer", CustomerSchema);
