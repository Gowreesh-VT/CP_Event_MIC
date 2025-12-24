import mongoose, { Schema, Document, Model } from "mongoose";

/*
 * Consolidated Team Interface
 * Combines fields from both PRs to ensure no logic breaks.
 */
export interface ITeam extends Document {
  teamName?: string;         // Used by PR 1
  name?: string;             // Used by PR 2
  email?: string;            // Used by PR 1
  teamId?: string;           // Used by PR 2
  members?: string[];        // Used by PR 2
  codeforcesHandle: string;  // Used by both
  lastSync?: Date | null;    // Used by PR 2
  createdAt?: Date;
  updatedAt?: Date;
}

const TeamSchema: Schema<ITeam> = new Schema(
  {
    // Fields from PR 1
    teamName: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true },

    // Fields from PR 2
    teamId: { type: String, unique: true, sparse: true },
    name: { type: String, sparse: true },
    members: [{ type: String }],
    
    // Shared / Critical Fields
    codeforcesHandle: { type: String, required: true, trim: true },
    lastSync: { type: Date, default: null },
  },
  {
    timestamps: true, // Supports the updatedAt/createdAt logic
  }
);

// Prevent "OverwriteModelError" and export a single model
const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;