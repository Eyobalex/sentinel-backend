import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  alertEmail: string;
  cleanupSchedule: string;
  batchAuditSchedule: string;
}

const settingsSchema: Schema = new Schema({
  alertEmail: {
    type: String,
    default: process.env.ALERT_EMAIL_TO || "",
  },
  cleanupSchedule: {
    type: String,
    default: "0 * * * *", // Default: Every hour
  },
  batchAuditSchedule: {
    type: String,
    default: "0 */3 * * *", // Default: Every 3 hours
  },
});

export default mongoose.model<ISettings>("Settings", settingsSchema);
