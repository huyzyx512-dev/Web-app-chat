import db from "../db/models/index.js";
import { Op } from "sequelize"; // Đừng quên import Op

export const createConversation = async (req, res) => {
  const t = await db.sequelize.transaction(); // Dùng transaction để an toàn
  try {
    const userId = req.user.id;
    const { type, groupName, memberIds } = req.body;

    if (
      !type ||
      (type === "group") & !groupName ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" });
    }

    let conversation;

    // Tạo conversation type="direct"
    if (type === "direct") {
      const participantId = memberIds[0];

      if (participantId === userId) {
        return res
          .status(400)
          .json({ message: "Không thể chat với chính mình" });
      }

      // Tìm cuộc trò chuyện direct đã tồn tại giữa 2 người
      const existingConversations = await db.Conversation.findAll({
        include: [
          {
            model: db.Participant,
            as: "participants",
            where: { userId: { [db.Op.in]: [userId, participantId] } },
            attributes: [],
          },
        ],
        group: ["Conversation.id"],
        having: db.sequelize.literal("COUNT(*) = 2"),
        attributes: ["id"],
        raw: true,
      });

      if (existingConversations.length > 0) {
        conversation = await db.Conversation.findByPk(
          existingConversations[0].id,
          {
            include: [
              {
                model: db.Participant,
                as: "participants",
                include: [
                  {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "displayName", "avatarUrl"],
                  },
                ],
              },
              // nếu bạn có seenBy, lastMessage... thì include thêm ở đây
            ],
          }
        );
      } else {
        // Tạo mới
        conversation = await db.Conversation.create(
          {
            type: "direct",
            lastMessageAt: new Date(),
          },
          { transaction: t }
        );
        await db.Participant.bulkCreate(
          [
            { userId, conversationId: conversation.id },
            { userId: participantId, conversationId: conversation.id },
          ],
          { transaction: t }
        );
      }
    }

    // ================== GROUP CONVERSATION ==================
    if (type === "group") {
      // Tạo nhóm mới
      conversation = await db.Conversation.create(
        {
          type: "group",
          groupName: groupName.trim(),
          createdByUserId: userId,
          lastMessageAt: new Date(),
        },
        { transaction: t }
      );
      const participantsToAdd = [
        { userId, conversationId: conversation.id },
        ...memberIds
          .filter((id) => id !== userId) // tránh trùng người tạo
          .map((id) => ({ userId: id, conversationId: conversation.id })),
      ];
      await db.Participant.bulkCreate(participantsToAdd, { transaction: t });
    }

    if (!conversation) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Type chỉ được là 'direct' hoặc 'group'" });
    }

    await t.commit();

    // Load đầy đủ dữ liệu trả về
    const result = await db.Conversation.findByPk(conversation.id, {
      include: [
        {
          model: db.Participant,
          as: "participants",
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "displayName", "avatarUrl"],
            },
          ],
        },
      ],
    });
    return res.status(201).json({ conversation: result });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi tạo conversation:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await db.Conversation.findAll({
      attributes: [
        "id",
        "type",
        "groupName",
        "lastMessageAt",
        "lastMessageContent",
        "lastMessageSenderId",
        "createdAt",
        "updatedAt",
        "unreadCounts",
      ],
      include: [
        // 1️⃣ FILTER: Chỉ lấy conversation mà user hiện tại tham gia
        {
          model: db.Participant,
          as: "participants",
          where: { userId: userId }, // Bắt buộc phải có user này
          required: true,
          attributes: [], // Không lấy data vì đây chỉ là bước lọc
        },
        // 2️⃣ FETCH: Lấy TẤT CẢ thành viên trong những conversation đã lọc được
        {
          model: db.Participant,
          as: "allParticipants",
          required: false, // Dùng false để không làm mất bản ghi nếu quan hệ trống
          attributes: ["userId", "conversationId"],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "displayName", "avatarUrl"],
            },
          ],
        },
        // 3️⃣ Lấy thông tin chi tiết người gửi tin nhắn cuối cùng
        {
          model: db.User,
          as: "lastMessageSender",
          attributes: ["id", "displayName", "avatarUrl"],
          required: false,
        },
        // 4️⃣ Lấy thông tin những người đã xem
        {
          model: db.ConversationSeen,
          as: "seenBy",
          required: false,
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "displayName", "avatarUrl"],
            },
          ],
        },
      ],
      // Sắp xếp
      order: [
        ["lastMessageAt", "DESC"],
        ["updatedAt", "DESC"],
      ],
      // Quan trọng: Phân trang hoặc tránh lặp bản ghi khi join nhiều
      distinct: true,
      // subQuery: false giúp tránh lỗi "Unknown column" khi dùng order/limit với include phức tạp
      subQuery: false,
    });

    const formatted = conversations.map((convo) => {
      // Chuyển conversation thành plain object (an toàn)
      const plainConvo = convo.toJSON ? convo.toJSON() : convo;

      delete plainConvo.participants;

      return {
        ...plainConvo,
        unreadCounts: plainConvo.unreadCounts || {}, // đảm bảo luôn là object
      };
    });
    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi khi lấy conversation:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  // ... trong controller của bạn
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;
    // 1. Cấu hình điều kiện lọc
    const whereCondition = { conversationId };
    // Nếu có cursor (thời gian của tin nhắn cũ nhất đã load),
    // tìm các tin nhắn có thời gian nhỏ hơn (cũ hơn)
    if (cursor) {
      whereCondition.createdAt = { [Op.lt]: new Date(cursor) };
    }
    // 2. Query dữ liệu
    let messages = await db.Message.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]], // Sắp xếp mới nhất lên đầu để lấy đúng limit
      limit: Number(limit) + 1, // Lấy dư 1 để kiểm tra trang tiếp theo
      // include: [{ model: db.User, as: 'sender', attributes: ['displayName', 'avatarUrl'] }] // Thêm nếu cần
    });
    // 3. Xử lý Cursor cho trang tiếp theo
    let nextCursor = null;
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      // Lưu ý: SQL trả về đối tượng Date, dùng toISOString() để gửi về client
      nextCursor = nextMessage.createdAt.toISOString();
      // Loại bỏ phần tử thừa dùng để check trang tiếp theo
      messages.pop();
    }
    // 4. Đảo ngược lại để tin nhắn cũ ở trên, mới ở dưới (phù hợp UI chat)
    messages = messages.reverse();
    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy messages: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await db.Participant.findAll({
      where: { userId },
      attributes: ["conversationId"],
      raw: true,
      nest: true,
    });
    return conversations.map((c) => c.conversationId?.toString());
  } catch (error) {
    console.error("Lỗi khi fetch conversations: ", error);
    return [];
  }
};
