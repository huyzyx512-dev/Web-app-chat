"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      // 1. Quan hệ cho 'createdBy' (từ 'groupSchema')
      // Một Conversation (group) được tạo bởi một User
      Conversation.belongsTo(models.User, {
        foreignKey: "createdByUserId",
        as: "creator",
      });

      Conversation.hasMany(models.Participant, {
        foreignKey: "conversationId",
        as: "participants",
      });
      Conversation.hasMany(models.Participant, {
        foreignKey: "conversationId",
        as: "allParticipants", // dùng để LẤY DATA
      });

      // 4. Quan hệ cho 'lastMessage.senderId'
      // Tin nhắn cuối cùng thuộc về một User (người gửi)
      Conversation.belongsTo(models.User, {
        foreignKey: "lastMessageSenderId",
        as: "lastMessageSender",
      });

      // Nối với ConversationSeen
      Conversation.hasMany(models.ConversationSeen, {
        foreignKey: "conversationId", // Tên cột FK trong bảng ConversationSeen
        as: "seenBy", // Alias để dùng khi include (tùy chọn nhưng khuyến khích)
        onDelete: "CASCADE", // Tùy chọn: xóa conversation thì xóa luôn seen records
      });
    }
  }
  Conversation.init(
    {
      // Sequelize tự động thêm 'id' làm khóa chính (Primary Key)
      type: {
        type: DataTypes.ENUM("direct", "group"),
        allowNull: false,
      },

      // --- Các trường được 'làm phẳng' từ 'groupSchema' ---
      groupName: {
        type: DataTypes.STRING,
        allowNull: true, // Chỉ áp dụng cho 'group' type
      },
      createdByUserId: {
        type: DataTypes.INTEGER, // Giả sử ID người dùng là INTEGER
        allowNull: true,
        references: {
          model: "Users", // Tên bảng (thường là số nhiều)
          key: "id",
        },
        onDelete: "SET NULL", // Nếu xóa User, không xóa group
        onUpdate: "CASCADE",
      },

      // --- 'participants' được xử lý qua bảng trung gian (association) ---

      // --- 'seenBy' được xử lý qua bảng trung gian (association) ---

      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // --- Các trường được 'làm phẳng' từ 'lastMessageSchema' ---
      // Ghi chú: 'lastMessage._id' (String) trong Mongoose có thể là ID của Message.
      // Nếu vậy, bạn nên lưu 'lastMessageId' (INTEGER/UUID) làm khóa ngoại tới bảng 'Messages'
      lastMessageContent: {
        type: DataTypes.TEXT, // Dùng TEXT cho nội dung dài
        allowNull: true,
      },
      lastMessageSenderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      lastMessageCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // 'unreadCounts' (Map) được chuyển thành JSON
      unreadCounts: {
        type: DataTypes.JSON, // Hoặc DataTypes.JSONB (tốt hơn cho PostgreSQL)
        allowNull: false,
        defaultValue: {},
      },

      // Sequelize tự động thêm 'createdAt' và 'updatedAt' (timestamps: true)
    },
    {
      sequelize,
      modelName: "Conversation",
      // Chỉ mục (Index) từ Mongoose
      indexes: [
        {
          // Tương đương 'lastMessageAt: -1'
          fields: ["lastMessageAt"],
        },
        // Chỉ mục 'participant.userId' sẽ nằm trên bảng 'Participant'
      ],
    }
  );
  return Conversation;
};
