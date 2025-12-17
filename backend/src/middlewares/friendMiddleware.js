import db from "../db/models/index.js";

const pair = (a, b) => (a > b ? [b, a] : [a, b]);

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user.id;
    const recipientId = req.body?.recipientId ?? null;
    const memberIds = req.body?.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp recipientId hoặc memberIds" });
    }

    if (recipientId) {
      const [userAId, userBId] = pair(me, recipientId);

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
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await db.Friend.findOne({
        where: [{ userAId: userA }, { userBId: userB }],
      });
      return friend ? null : memberId;
    });

    const results = await Promise.all(friendChecks);
    const notFriends = results.filter(Boolean);

    if (notFriends.length > 0) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể thêm bạn bè vào nhóm.", notFriends });
    }

    next();
  } catch (error) {
    console.log("Lỗi trước khi checkFriendShip", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    const conversation = await db.Conversation.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    const isMember = await db.Participant.findOne({
      where: [{ userId }, { conversationId }],
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Bạn không nằm ở trong nhóm này" });
    }

    next();
  } catch (error) {
    console.log("Lỗi checkGroupMembership: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
