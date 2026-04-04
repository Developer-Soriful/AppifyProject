import mongoose, { Document, Schema, Types } from "mongoose";

export type LikeTarget = "Post" | "Comment" | "Reply";

export interface ILikeDocument extends Document {
  user: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: LikeTarget;
  createdAt: Date;
}

const likeSchema = new Schema<ILikeDocument>(
  {
    user:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId:   { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    targetType: { type: String, enum: ["Post", "Comment", "Reply"], required: true },
  },
  { timestamps: true, updatedAt: false }
);

// Prevents duplicate likes and enables fast lookup
likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });
likeSchema.index({ targetId: 1, targetType: 1 });

export default mongoose.model<ILikeDocument>("Like", likeSchema);
