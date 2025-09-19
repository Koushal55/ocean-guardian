import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocialMention extends Document {
  tweet_id: number;
  text: string;
  author_id: string;
  created_at: Date;
  source: string;
  processed: boolean;
}

const SocialMentionSchema: Schema<ISocialMention> = new Schema({
  tweet_id: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  author_id: { type: String, required: true },
  created_at: { type: Date, required: true },
  source: { type: String, default: 'twitter' },
  processed: { type: Boolean, default: false },
});

// This robust pattern ensures the model is only compiled once
const SocialMentionModel: Model<ISocialMention> = mongoose.models.SocialMention || mongoose.model<ISocialMention>('SocialMention', SocialMentionSchema);

export default SocialMentionModel;