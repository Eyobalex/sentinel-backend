import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IRefreshToken extends Document {
  token: string;
  user: IUser["_id"];
  expiresAt: Date;
}

const refreshTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
});

// Expire automatically
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
