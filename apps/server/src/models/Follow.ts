import mongoose, { Document, Schema } from "mongoose";

export interface IFollowDocument extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  status: "pending" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollowDocument>(
  {
    follower: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    following: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
      index: true
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model<IFollowDocument>("Follow", followSchema);
