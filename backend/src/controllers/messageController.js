import db from "../db/models/index.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const senderId = req.user.id;
    const { recipientId, content, conversationId } = req.body;

    // === 1. Validate ===
    if (!recipientId || !content?.trim()) {
      await t.rollback();
      return res.status(400).json({
        message: "Thiếu recipientId hoặc nội dung tin nhắn",
      });
    }

    if (senderId === recipientId) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Không thể gửi tin nhắn cho chính mình" });
    }

    let conversation;

    // === 2. Dùng conversationId có sẵn (nếu frontend gửi lên) ===
    if (conversationId) {
      conversation = await db.Conversation.findOne({
        where: { id: conversationId, type: "direct" },
        transaction: t,
      });

      if (!conversation) {
        await t.rollback();
        return res
          .status(404)
          .json({ message: "Cuộc trò chuyện không tồn tại" });
      }

      // Kiểm tra người nhận có trong cuộc trò chuyện không
      const recipientInConv = await db.Participant.findOne({
        where: {
          conversationId: conversation.id,
          userId: recipientId,
        },
        transaction: t,
      });

      if (!recipientInConv) {
        await t.rollback();
        return res
          .status(403)
          .json({ message: "Người nhận không thuộc cuộc trò chuyện này" });
      }
    }
    // === 3. Không có conversationId → tìm hoặc tạo mới 1-1 ===
    else {
      // Cách an toàn nhất: dùng subquery với bind parameter (tránh SQL injection)
      const existingParticipant = await db.Participant.findOne({
        attributes: ["conversationId"],
        where: {
          userId: senderId,
        },
        include: [
          {
            model: db.Conversation,
            as: "conversation",
            where: { type: "direct" },
            attributes: [],
          },
        ],
        // Tìm conversation mà recipientId cũng tham gia
        having: db.sequelize.literal(
          `EXISTS (
            SELECT 1 FROM Participants p2 
            WHERE p2.conversationId = Participant.conversationId 
              AND p2.userId = :recipientId
          )`
        ),
        replacements: { recipientId }, // ← an toàn, không bị injection
        transaction: t,
        raw: true,
      });

      if (existingParticipant) {
        conversation = await db.Conversation.findByPk(
          existingParticipant.conversationId,
          {
            transaction: t,
          }
        );
      } else {
        // Tạo conversation mới
        conversation = await db.Conversation.create(
          {
            type: "direct",
            unreadCounts: { [senderId]: 0, [recipientId]: 0 },
          },
          { transaction: t }
        );

        await db.Participant.bulkCreate(
          [
            { userId: senderId, conversationId: conversation.id },
            { userId: recipientId, conversationId: conversation.id },
          ],
          { transaction: t }
        );
      }
    }

    // === 4. Tạo tin nhắn ===
    const message = await db.Message.create(
      {
        conversationId: conversation.id,
        senderId,
        content: content.trim(),
      },
      { transaction: t }
    );

    console.log("Message: ", message);
    // === 5. Cập nhật conversation (lastMessage + unreadCounts + xóa seen) ===
    await updateConversationAfterCreateMessage(
      conversation,
      message,
      senderId,
      {
        transaction: t,
        db,
      }
    );

    await t.commit();

    // === 6. Trả về tin nhắn + thông tin người gửi ===
    const messageWithSender = await db.Message.findByPk(message.id, {
      attributes: ["id", "content", "createdAt", "conversationId"],
      include: [
        {
          model: db.User,
          as: "sender",
          attributes: ["id", "displayName", "avatarUrl"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: messageWithSender,
      conversationId: conversation.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi gửi tin nhắn trực tiếp:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const sendGroupMessage = (req, res) => {};
