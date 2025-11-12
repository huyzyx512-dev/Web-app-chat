import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pool from "../libs/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

dotenv.config();

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !email || !firstName || !lastName || !password) {
      return res
        .status(400)
        .json(`Không thể thiếu username, password, email, fisrtName, lastName`);
    }

    // Kiểm tra tài khoản tồn tại chưa
    let [results, fields] = await pool.query(
      "select * from users where username = ?",
      [username]
    );

    if (results[0]) {
      return res.status(409).json({ message: "Username existed" });
    }

    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // Tạo user mới
    await pool.query(
      "insert into users(username, hashedPassword, email, displayName) values (?,?,?,?)",
      [username, hashedPassword, email, `${firstName} ${lastName}`]
    );
    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    // Lấy Inputs
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password." });
    }
    // Lấy hashPassword trong db so với password input
    let [results, fields] = await pool.query(
      "select * from users where username = ?",
      [username]
    );

    if (!results[0]) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      results[0].hashedPassword
    );

    if (!passwordCorrect)
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác." });
    // nếu khớp, tạo accessToken với JWT
    const accessToken = jwt.sign(
      { userId: results[0].id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // tạo session mới để lưu refresh token
    await pool.query("insert into sessions values(?,?,?)", [
      results[0].id,
      refreshToken,
      new Date(Date.now() + REFRESH_TOKEN_TTL),
    ]);

    // trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // backend, frontend deploy rieng
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về trong res
    return res.status(200).json({
      message: `User ${results[0].displayName} đã logged in!`,
      accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    // Lấy token refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // xóa refresh tokn trong Session
      await pool.execute("DELETE FROM sessions WHERE refreshToken = ?", [
        token,
      ]);
      // Xóa cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    // so với refresh token trong db
    const [results, fields] = await pool.query(
      "select * from sessions where refreshToken = ?",
      [token]
    );
    const session = results[0];

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // kiểm tra hết hạn chưa
    let checkExpiredToken = session.expiresAt < new Date();

    if (checkExpiredToken) {
      return res.status(403).json({ message: "Token đã hết hạn" });
    }

    // tạo access token mới
    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // return
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
