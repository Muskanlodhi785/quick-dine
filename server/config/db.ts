import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to server/.env (see server/.env.example).");
    process.exit(1);
  }

  mongoose.connection.on("connected", () =>
    console.log("MongoDB connected successfully")
  );
  mongoose.connection.on("error", (err) =>
    console.error("MongoDB connection error:", err.message)
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("MongoDB disconnected")
  );

  await mongoose.connect(uri);
};

export default connectDB;
