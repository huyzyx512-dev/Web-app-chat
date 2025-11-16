'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Định nghĩa quan hệ:
      // 1. Một tin nhắn (Message) thuộc về một Cuộc hội thoại (Conversation)
      Message.belongsTo(models.Conversation, {
        foreignKey: 'conversationId',
        as: 'conversation'
      });

      // 2. Một tin nhắn (Message) thuộc về một Người dùng (User - người gửi)
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });
    }
  }
  Message.init({
    // Sequelize tự động thêm 'id' làm khóa chính (PK)
    
    // Trường 'conversationId' từ Mongoose
    conversationId: {
      type: DataTypes.INTEGER, // Giả sử ID của Conversation là INTEGER
      allowNull: false,
      references: {
        model: 'Conversations', // Tên BẢNG (thường là số nhiều)
        key: 'id'
      },
      onDelete: 'CASCADE', // Nếu xóa Conversation, xóa luôn tin nhắn
      onUpdate: 'CASCADE'
    },
    
    // Trường 'senderId' từ Mongoose
    senderId: {
      type: DataTypes.INTEGER, // Giả sử ID của User là INTEGER
      allowNull: false,
      references: {
        model: 'Users', // Tên BẢNG
        key: 'id'
      },
      // Nếu xóa người dùng, giữ lại tin nhắn nhưng senderId -> null
      onDelete: 'SET NULL', 
      onUpdate: 'CASCADE'
    },
    
    // Trường 'content' từ Mongoose
    content: {
      type: DataTypes.TEXT, // Dùng TEXT cho nội dung tin nhắn (an toàn hơn String)
      allowNull: true // Cho phép tin nhắn chỉ có hình ảnh (content: null)
      // 'trim: true' (Mongoose) thường được xử lý ở tầng ứng dụng
      // hoặc dùng 'setters' trong Sequelize
    },
    
    // Trường 'imgUrl' từ Mongoose
    imgUrl: {
      type: DataTypes.TEXT, // Dùng TEXT cho URL (an toàn hơn String)
      allowNull: true
    }

    // 'createdAt' và 'updatedAt' được tự động thêm (timestamps: true)
  }, {
    sequelize,
    modelName: 'Message',
    // 'timestamps: true' là mặc định trong Sequelize

    // Chuyển đổi các indexes từ Mongoose
    indexes: [
      {
        // Tương đương: messageSchema.index({ conversationId: 1, createdAt: -1 });
        // Chỉ mục này cũng bao gồm luôn 'index: true' trên 'conversationId'
        fields: [
          'conversationId',
          ['createdAt', 'DESC'] // Cú pháp cho thứ tự giảm dần (DESC)
        ]
      }
    ]
  });
  return Message;
};