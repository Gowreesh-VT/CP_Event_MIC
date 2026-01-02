import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Round 1 State - Singleton document to track Round 1 timing
 * Only one document should exist in this collection
 */
export interface IRound1State extends Document {
    status: 'waiting' | 'active' | 'completed';
    duration: number;
    startTime?: Date;
    endTime?: Date;
    extendedBy: number;
    createdAt: Date;
    updatedAt: Date;
}

const Round1StateSchema = new Schema<IRound1State>(
    {
        status: {
            type: String,
            required: true,
            enum: ['waiting', 'active', 'completed'],
            default: 'waiting',
        },
        duration: {
            type: Number,
            required: true,
            default: 3600,
        },
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        extendedBy: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Round1State: Model<IRound1State> =
    mongoose.models.Round1State ||
    mongoose.model<IRound1State>('Round1State', Round1StateSchema);

export default Round1State;
