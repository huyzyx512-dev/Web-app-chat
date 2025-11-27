import db from "../db/models/index.js";

const pair = (a, b) => (a > b ? [b, a] : [a, b]);

export const checkFriendShip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recipientId = req.body?.recipientId ?? null;

    if (!recipientId) {
      return res.status(400).json({ message: "Cần cung cấp recipientId" });
    } else {
      const [userAId, userBId] = pair(userId, recipientId);

      const isFriend = await db.Friend.findOne({
        where: { userAId, userBId },
        raw: true,
        nest: true,
      });

      if (!isFriend) {
        return res
          .status(400)
          .json({ message: "Bạn chưa kết bạn với người này" });
      }

      return next();
    }

    // todo: chat nhóm
  } catch (error) {
    console.log("Lỗi trước khi checkFriendShip", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
