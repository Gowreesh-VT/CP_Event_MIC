import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Tracks each stage of Round 2 Tug of War
 */
export interface IRound2Round extends Document {
  roundNumber: number;
  roundName: string; // 'Quarterfinals' | 'Semifinals' | 'Finals'
  matchIds: Types.ObjectId[];
  status: 'pending' | 'active' | 'completed';
  duration: number;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Round2RoundSchema = new Schema<IRound2Round>(
  {
    roundNumber: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
      unique: true,
    },
    roundName: {
      type: String,
      required: true,
      enum: ['Quarterfinals', 'Semifinals', 'Finals'],
    },
    matchIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Match',
    }],
    status: {
      type: String,
      required: true,
      enum: ['pending', 'active', 'completed'],
      default: 'pending',
    },
    duration: {
      type: Number,
      required: true,
      default: 2700,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

Round2RoundSchema.index({ roundNumber: 1 }, { unique: true });
Round2RoundSchema.index({ status: 1 });

export const Round2Round: Model<IRound2Round> =
  mongoose.models.Round2Round ||
  mongoose.model<IRound2Round>('Round2Round', Round2RoundSchema);

export default Round2Round;
