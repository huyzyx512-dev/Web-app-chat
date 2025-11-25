import { Op, where } from "sequelize";
import db from "../db/models/index.js";

// send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    // Lấy dữ liệu người nhận, người gửi
    const { to, message } = req.body;
    const from = req.user.id;
    // Kiểm tra trùng người nhận == người gửi không
    if (to == from) {
      return res
        .status(400)
        .json({ message: "Không thể gửi lời mời cho chính mình" });
    }

    // Kiểm tra người nhận tồn tại không
    const existFriend = await db.User.findOne({ where: { id: to } });
    if (!existFriend) {
      return res.status(400).json({ message: "Người nhận không tồn tại" });
    }

    // Hoán đổi userAid < userBid
    let userAid = to;
    let userBid = from;

    if (userAid > userBid) {
      [userAid, userBid] = [userBid, userAid];
    }

    // Kiểm tra người đó đã là bạn bè hay đã gửi lời mời hay chưa
    const alreadyFriend = await db.Friend.findOne({
      where: {
        [Op.and]: [{ userAid: userAid }, { userBid: userBid }],
      },
    });
    console.log("fiend: ", alreadyFriend);
    if (alreadyFriend) {
      return res.status(400).json({ message: "Hai người đã là bạn bè" });
    }

    console.log("to ", to);
    console.log("from ", from);
    const existedRequest = await db.FriendRequest.findOne({
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ fromUserId: from }, { toUserId: to }],
          },

          {
            [Op.and]: [{ fromUserId: to }, { toUserId: from }],
          },
        ],
      },
      raw: true,
      nest: true,
    });
    console.log(existedRequest);
    if (existedRequest) {
      return res
        .status(400)
        .json({ message: "Đã có lời mời kết bạn đang chờ" });
    }

    // Tiến hành tạo lời gửi lời mời
    const request = await db.FriendRequest.create({
      fromUserId: parseInt(from),
      toUserId: parseInt(to),
      message: message,
    });

    // Trả về
    return res
      .status(200)
      .json({ message: "Gửi lời mời kết bạn thành công", request });
  } catch (error) {
    console.log(`Lỗi khi gửi lời mời kết bạn`, error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
// Accept friend request
export const acceptFriend = async (req, res) => {
  try {
    const { requestId } = req.params; // requestID
    const userId = req.user.id; // Id của người được nhận lời mời kết bạn và đang đăng nhập để chấp nhận

    const request = await db.FriendRequest.findOne({
      where: { id: parseInt(requestId) },
    });

    if (!request)
      return res
        .status(400)
        .json({ message: "Không tìm thấy lời mời kết bạn" });

    if (request.toUserId !== userId)
      return res
        .status(400)
        .json({ message: "Bạn không có quyền chấp nhận lời mời kết bạn này" });

    const friend = await db.Friend.create({
      userAId: request.fromUserId,
      userBId: request.toUserId,
    });

    await db.FriendRequest.destroy({
      where: {
        id: requestId,
      },
    });

    const from = await db.User.findOne({
      where: { id: request.fromUserId },
      attributes: ["id", "displayName", "avatarUrl"],
    });

    return res.status(200).json({
      message: "Hai bạn đã trở thành bạn bè",
      newFriend: {
        id: from?.id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.log(`Lỗi khi chấp nhận lời mời kết bạn`, error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cacel friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    console.log("reuestId", parseInt(requestId));
    console.log("userId", userId);
    const request = await db.FriendRequest.findOne({
      where: { id: parseInt(requestId) },
    });

    if (!request)
      return res.status(400).json({ message: "Lời mời kết bạn không tồn tại" });

    if (String(request.toUserId) !== String(userId))
      return res.status(400).json({ message: "Bạn không thể xóa yêu cầu này" });

    await db.FriendRequest.destroy({
      where: { fromUserId: request.fromUserId },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log(`Lỗi khi từ chối lời mời kết bạn`, error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await db.Friend.findAll({
      where: {
        [Op.or]: [{ userAId: userId }, { userBId: userId }],
      },
      include: [
        {
          model: db.User,
          as: "userA",
          attributes: ["id", "displayName", "avatarUrl"],
        },
        {
          model: db.User,
          as: "userB",
          attributes: ["id", "displayName", "avatarUrl"],
        },
      ],
      raw: true,
      nest: true,
    });

    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }
    const friends = friendships.map((f) =>
      f.userA.id === userId ? f.userB : f.userA
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.log(`Lỗi khi lấy danh sách bạn bè`, error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id; // <-- return from authMiddleware

    const attributeFields = ["id", "displayName", "avatarUrl"];
    const received = await db.FriendRequest.findAll({
      where: { toUserId: userId },
      include: [
        {
          model: db.User,
          as: "sender",
          attributes: attributeFields,
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true, // ← quan trọng
      nest: true, // ← quan trọng
    });

    const sent = await db.FriendRequest.findAll({
      where: { fromUserId: userId },
      include: [
        {
          model: db.User,
          as: "receiver",
          attributes: attributeFields,
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true, // ← quan trọng
      nest: true, // ← quan trọng
    });

    return res.status(200).json({ sent, received });
  } catch (error) {
    console.log(`Lỗi khi lấy danh sách lời mời kết bạn`, error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cancel friend <-- Tự làm
export const cancelFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.body.friendId;

    if (!friendId || isNaN(friendId)) {
      return res.status(400).json({
        message: "Thiếu hoặc sai định dạng friendId",
      });
    }

    if (Number(friendId) === userId) {
      return res
        .status(400)
        .json({ message: "Không thể hủy kết bạn với chính mình" });
    }

    const friendship = await db.Friend.findOne({
      where: {
        [Op.or]: [
          { userAId: userId, userBId: friendId },
          { userAId: friendId, userBId: userId },
        ],
      },
      attributes: ["id"],
      raw: true,
      nest: true,
    });
    console.log("friendship", friendship);

    if (!friendship) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy mối quan hệ bạn bè để hủy" });
    }

    await db.Friend.destroy();

    return res
      .status(200)
      .json({
        message: "Hủy kết bạn thành công",
        removedFriendId: Number(friendId),
      });
  } catch (error) {
    console.log(`Lỗi khi hủy kết bạn`, error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
