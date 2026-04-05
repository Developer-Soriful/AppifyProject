import mongoose, { Document, Schema, Types } from "mongoose";

export type Visibility = "public" | "private";

export interface IPostDocument extends Document {
  author: Types.ObjectId;
  content: string;
  image?: string;
  visibility: Visibility;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;

  updatedAt: Date;
}

const postSchema = new Schema<IPostDocument>(
  {
    author:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:       { type: String, required: true, trim: true, maxlength: 5000 },
    image:         { type: String },
    visibility:    { type: String, enum: ["public", "private"], default: "public" },
    likesCount:    { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    sharesCount:   { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Feed queries: newest first
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });

export default mongoose.model<IPostDocument>("Post", postSchema);
