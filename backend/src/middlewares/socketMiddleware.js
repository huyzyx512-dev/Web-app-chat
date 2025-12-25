import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../db/models/index.js";

dotenv.config();

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized - Token không tồn tại"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return next(
        new Error("Unauthorized - Token khôn hợp lệ hoặc đã hết hạn")
      );
    }

    const user = await db.User.findOne({
      where: { id: decoded.userId },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new Error("User không tồn tại"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Lỗi khi verify JWT trong socketMiddleware: ", error);
    next(new Error("Unauthorized"));
  }
};
