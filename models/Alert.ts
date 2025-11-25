import mongoose, { Document, Schema } from "mongoose";

export interface IRawLog {
  type: string;
  message: string;
  ip: string;
  method?: string;
  path?: string;
  [key: string]: any;
}

export interface IIpReputation {
  isPublic: boolean;
  abuseConfidenceScore?: number;
  reports?: number;
  [key: string]: any;
}

export interface IAiAnalysis {
  severity: "High" | "Medium" | "Low";
  summary: string;
  recommended_action: string;
}

export interface IAlert extends Document {
  timestamp: Date;
  rawLog: IRawLog;
  ipReputation?: IIpReputation;
  aiAnalysis: IAiAnalysis;
  isRead: boolean;
  isResolved: boolean;
}

const alertSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now },
  rawLog: { type: Object, required: true },
  ipReputation: { type: Object },
  aiAnalysis: {
    severity: { type: String, enum: ["High", "Medium", "Low"], required: true },
    summary: { type: String },
    recommended_action: { type: String },
  },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
});

export default mongoose.model<IAlert>("Alert", alertSchema);
