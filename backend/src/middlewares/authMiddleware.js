import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../libs/db.js";

dotenv.config();

// authorization - xác minh user là ai
export const protectedRoute = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    // xác nhận token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodeUser) => {
        if (err) {
          console.log(err);
          return res
            .status(403)
            .json({ message: "Access token hết hạn hoặc không đúng" });
        }

        // tìm user
        let [results, fields] = await pool.query(
          "select * from users where id = ?",
          [decodeUser.userId]
        );

        if (!results[0]) {
          return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // trả user về trong req
        req.user = results[0];
        next();
      }
    );
  } catch (error) {
    console.error("Lỗi khi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
