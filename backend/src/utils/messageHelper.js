import db from "../db/models/index.js";

export const updateConversationAfterCreateMessage = async (
  conversation,
  message,
  senderId,
  { transaction, db } = {}
) => {
  const senderIdStr = senderId.toString();

  // Xóa hết seen
  await db.ConversationSeen.destroy({
    where: { conversationId: conversation.id },
    transaction,
  });
  // Lấy participants
  const participants = await db.Participant.findAll({
    where: { conversationId: conversation.id },
    attributes: ["userId"],
    transaction,
  });

  // Cập nhật unreadCounts
  let unreadCounts = conversation.unreadCounts || {};

  participants.forEach((p) => {
    const id = p.userId.toString();
    unreadCounts[id] = id === senderIdStr ? 0 : (unreadCounts[id] || 0) + 1;
  });

  // Cập nhật conversation
  await db.Conversation.update(
    {
      lastMessageAt: message.createdAt,
      lastMessageContent: message.content,
      lastMessageSenderId: senderId,
      lastMessageCreatedAt: message.createdAt,
      unreadCounts,
    },
    { where: { id: conversation.id }, transaction }
  );
};

export const emitNewMessage = (io, conversation, message) => {
  io.to(conversation.id.toString()).emit("new-message", {
    message,
    conversation: {
      id: conversation.id,
      lastMessageContent: conversation.lastMessageContent,
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: conversation.unreadCounts,
  });
};
