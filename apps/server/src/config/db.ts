import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URI or MONGODB_URI is not defined");

  await mongoose.connect(uri, { maxPoolSize: 10 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

export default connectDB;
