import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReplyDocument extends Document {
  comment: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<IReplyDocument>(
  {
    comment:    { type: Schema.Types.ObjectId, ref: "Comment", required: true },
    author:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:    { type: String, required: true, trim: true, maxlength: 1000 },
    likesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

replySchema.index({ comment: 1, createdAt: 1 });

export default mongoose.model<IReplyDocument>("Reply", replySchema);
