import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map(); // {userId: socketId}

io.on("connection", async (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} online với socket ${socket.id}`);

  onlineUsers.set(user.id, socket.id); // Thêm user online vào map
  io.emit("online-users", Array.from(onlineUsers.keys())); // cập nhật danh sách online

  const conversationIds = await getUserConversationsForSocketIO(user.id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });
  socket.on("disconnect", () => {
    onlineUsers.delete(user.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
