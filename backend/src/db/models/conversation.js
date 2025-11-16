'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      // 1. Quan hệ cho 'createdBy' (từ 'groupSchema')
      // Một Conversation (group) được tạo bởi một User
      Conversation.belongsTo(models.User, {
        foreignKey: 'createdByUserId',
        as: 'creator'
      });

      // 2. Quan hệ cho 'participants' (Nhiều-nhiều)
      // Một Conversation có nhiều User (participants)
      // Một User có thể tham gia nhiều Conversation
      // -> Yêu cầu bảng trung gian 'Participant'
      Conversation.belongsToMany(models.User, {
        through: models.Participant, // Sử dụng model Participant làm bảng trung gian
        foreignKey: 'conversationId',
        otherKey: 'userId',
        as: 'participants'
      });

      // 3. Quan hệ cho 'seenBy' (Nhiều-nhiều)
      // Một Conversation được xem bởi nhiều User
      // Một User có thể xem nhiều Conversation
      // -> Yêu cầu bảng trung gian 'ConversationSeen' (hoặc tên tương tự)
      Conversation.belongsToMany(models.User, {
        through: 'ConversationSeen', // Có thể dùng tên bảng nếu không cần model
        foreignKey: 'conversationId',
        otherKey: 'userId',
        as: 'seenByUsers'
      });

      // 4. Quan hệ cho 'lastMessage.senderId'
      // Tin nhắn cuối cùng thuộc về một User (người gửi)
      Conversation.belongsTo(models.User, {
        foreignKey: 'lastMessageSenderId',
        as: 'lastMessageSender'
      });
    }
  }
  Conversation.init({
    // Sequelize tự động thêm 'id' làm khóa chính (Primary Key)
    type: {
      type: DataTypes.ENUM('direct', 'group'),
      allowNull: false
    },
    
    // --- Các trường được 'làm phẳng' từ 'groupSchema' ---
    groupName: {
      type: DataTypes.STRING,
      allowNull: true // Chỉ áp dụng cho 'group' type
    },
    createdByUserId: {
      type: DataTypes.INTEGER, // Giả sử ID người dùng là INTEGER
      allowNull: true,
      references: {
        model: 'Users', // Tên bảng (thường là số nhiều)
        key: 'id'
      },
      onDelete: 'SET NULL', // Nếu xóa User, không xóa group
      onUpdate: 'CASCADE'
    },
    
    // --- 'participants' được xử lý qua bảng trung gian (association) ---

    // --- 'seenBy' được xử lý qua bảng trung gian (association) ---

    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // --- Các trường được 'làm phẳng' từ 'lastMessageSchema' ---
    // Ghi chú: 'lastMessage._id' (String) trong Mongoose có thể là ID của Message.
    // Nếu vậy, bạn nên lưu 'lastMessageId' (INTEGER/UUID) làm khóa ngoại tới bảng 'Messages'
    lastMessageContent: {
      type: DataTypes.TEXT, // Dùng TEXT cho nội dung dài
      allowNull: true
    },
    lastMessageSenderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    lastMessageCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // 'unreadCounts' (Map) được chuyển thành JSON
    unreadCounts: {
      type: DataTypes.JSON, // Hoặc DataTypes.JSONB (tốt hơn cho PostgreSQL)
      allowNull: false,
      defaultValue: {}
    }
    
    // Sequelize tự động thêm 'createdAt' và 'updatedAt' (timestamps: true)
  }, {
    sequelize,
    modelName: 'Conversation',
    // Chỉ mục (Index) từ Mongoose
    indexes: [
      {
        // Tương đương 'lastMessageAt: -1'
        fields: ['lastMessageAt'] 
      }
      // Chỉ mục 'participant.userId' sẽ nằm trên bảng 'Participant'
    ]
  });
  return Conversation;
};