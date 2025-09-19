import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  hazardType: string;
  description: string;
  location: string;
  urgency: string;
  vesselInfo?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  status: 'submitted' | 'verified' | 'dismissed';
  submittedBy: mongoose.Schema.Types.ObjectId;
  imageUrls?: string[];
}

const ReportSchema: Schema<IReport> = new Schema({
  hazardType: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  urgency: { type: String, required: true },
  vesselInfo: { type: String },
  coordinates: {
    lat: { type: Number },
    lon: { type: Number },
  },
  status: {
    type: String,
    enum: ['submitted', 'verified', 'dismissed'],
    default: 'submitted',
  },
  imageUrls: { type: [String] }, 
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// This ensures the model is only compiled once and is always the correct type
const ReportModel: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default ReportModel;