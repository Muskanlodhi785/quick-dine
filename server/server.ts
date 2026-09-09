import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js";

await connectDB();
initCloudinary();

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Brohi Dining server running at http://localhost:${port}`);
});
