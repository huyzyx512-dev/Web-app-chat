import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import friendRoute from "./routes/friendRoute.js";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import pool from "./libs/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json());
app.use(cookieParser()); // Lấy dữ liêu từ cookie đã tạo
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// public routes
app.use("/api/auth", authRoute);

// private routes
app.use("/api/auth", protectedRoute, userRoute);
app.use("/api/friends", protectedRoute, friendRoute);
app.use("/api/message", protectedRoute, messageRoute);
app.use("/api/conversation", protectedRoute, conversationRoute);

// Connect DB

await pool
  .getConnection()
  .then(() => {
    console.log(`Kết nối db thành công.`);
    app.listen(PORT, () => {
      console.log(`Server chạy trên công ${PORT}`);
    });
  })
  .catch(() => console.log(`Kết nối db thành công.`));
