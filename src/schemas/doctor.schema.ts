import { Types, Schema, model } from "mongoose";
import { v4 } from "node-uuid";

const doctorSchema = new Schema(
  {
    _id: { type: String, required: true, default: v4 },
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    lastLogin: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    otp: { type: String, required: false },
    retryCount: { type: Number, default: 0 },
    lastOtpTime: Date,
  },
  {
    timestamps: true,
  }
);

export interface IDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  lastLogin: Date;
  isDeleted: boolean;
  otp: string;
  retryCount?: number;
  lastOtpTime?: Date;
}

export const DoctorModel = model("doctors", doctorSchema);
