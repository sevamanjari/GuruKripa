import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log("ℹ️  No MONGODB_URI configured. Operating in fallback JSON datastore mode.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB connection warning: ${error.message}. Running in fallback JSON datastore mode.`);
    isConnected = false;
    return false;
  }
};

export const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};
