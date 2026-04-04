import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICommentDocument extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    post:         { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:      { type: String, required: true, trim: true, maxlength: 2000 },
    likesCount:   { type: Number, default: 0, min: 0 },
    repliesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });

export default mongoose.model<ICommentDocument>("Comment", commentSchema);
