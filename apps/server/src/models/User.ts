import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "@appify/shared";

export interface IUserDocument
  extends Document, Omit<IUser, "_id" | "createdAt" | "updatedAt"> {
  password: string;
  bio: string;
  location: string;
  website: string;
  followersCount: number;
  followingCount: number;
  savedPosts: mongoose.Types.ObjectId[];
  hiddenPosts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { 
      type: String, 
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback" 
    },
    bio: { type: String, trim: true, maxlength: 500, default: "" },
    location: { type: String, trim: true, maxlength: 100, default: "" },
    website: { type: String, trim: true, maxlength: 200, default: "" },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    hiddenPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});


userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

export default mongoose.model<IUserDocument>("User", userSchema);
