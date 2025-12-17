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
  await conversation.update(
    {
      lastMessageAt: message.createdAt,
      lastMessageContent: message.content,
      lastMessageSenderId: senderId,
      lastMessageCreatedAt: message.createdAt,
      unreadCounts,
    },
    { transaction }
  );
};
