import { Document, model, models, Schema } from "mongoose";

export interface IMedicine extends Document {
  name: string;
  category: "Tablets" | "Injections" | "Syrups" | string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema: Schema = new Schema<IMedicine>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const Medicine =
  models.Medicine || model<IMedicine>("Medicine", MedicineSchema);
