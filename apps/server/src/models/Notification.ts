import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = 
  | "like" 
  | "comment" 
  | "reply" 
  | "follow" 
  | "mention" 
  | "share";

export interface INotificationDocument extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedPost?: mongoose.Types.ObjectId;
  relatedComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["like", "comment", "reply", "follow", "mention", "share"],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedPost: { type: Schema.Types.ObjectId, ref: "Post" },
    relatedComment: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

// Index for fetching unread notifications
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotificationDocument>("Notification", notificationSchema);
