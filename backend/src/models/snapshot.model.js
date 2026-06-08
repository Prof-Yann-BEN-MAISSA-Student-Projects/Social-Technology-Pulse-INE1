import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema({
  externalId: { type: String, required: true },
  source:     { type: String, enum: ['reddit', 'hackernews', 'github'], required: true },
  score:      { type: Number, required: true },
  fetchedAt:  { type: Date, default: Date.now },
}, { timestamps: false });

snapshotSchema.index({ externalId: 1, fetchedAt: -1 });
snapshotSchema.index({ source: 1, fetchedAt: -1 });

export const Snapshot = mongoose.model('Snapshot', snapshotSchema);
