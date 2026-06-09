import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  title:      { type: String, required: true },
  url:        { type: String },
  score:      { type: Number, default: 0 },
  source:     { type: String, enum: ['reddit', 'hackernews', 'github'], required: true },
  country:    { type: String, default: 'GLOBAL' },
  fetchedAt:  { type: Date, default: Date.now },
  keywords:   [String],
  meta:       mongoose.Schema.Types.Mixed,
}, { timestamps: true });

itemSchema.index({ source: 1 });
itemSchema.index({ country: 1 });
itemSchema.index({ keywords: 1 });
itemSchema.index({ fetchedAt: -1 });
itemSchema.index({ score: -1 });
itemSchema.index({ fetchedAt: -1, keywords: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ createdAt: -1, keywords: 1 });

export const Item = mongoose.model('Item', itemSchema);
