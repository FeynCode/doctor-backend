import mongoose from "mongoose";
import { v4 } from "node-uuid";

const Schema = mongoose.Schema;

const userTokenSchema = new Schema({
  _id: { type: String, required: true, default: v4 },
  doctorId: { type: String, required: true, default: v4 },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
});

const UserToken = mongoose.model("user-token", userTokenSchema);

export default UserToken;
