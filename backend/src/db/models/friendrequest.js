'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FriendRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Định nghĩa quan hệ:
      // Một yêu cầu (Request) được gửi TỪ (from) một User
      FriendRequest.belongsTo(models.User, {
        foreignKey: 'fromUserId',
        as: 'sender' // Alias để truy vấn người gửi
      });

      // Một yêu cầu (Request) được gửi ĐẾN (to) một User
      FriendRequest.belongsTo(models.User, {
        foreignKey: 'toUserId',
        as: 'receiver' // Alias để truy vấn người nhận
      });
    }
  }
  FriendRequest.init({
    // Sequelize tự động thêm 'id' làm khóa chính (Primary Key)
    
    // Trường 'from' từ Mongoose
    fromUserId: {
      type: DataTypes.INTEGER, // Giả sử ID người dùng là INTEGER
      allowNull: false,
      references: {
        model: 'Users', // Tên BẢNG (thường là số nhiều)
        key: 'id'
      },
      onDelete: 'CASCADE', // Nếu xóa User, xóa luôn request
      onUpdate: 'CASCADE'
    },

    // Trường 'to' từ Mongoose
    toUserId: {
      type: DataTypes.INTEGER, // Giả sử ID người dùng là INTEGER
      allowNull: false,
      references: {
        model: 'Users', // Tên BẢNG
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },

    // Trường 'message' từ Mongoose
    message: {
      type: DataTypes.STRING(300), // Giới hạn 300 ký tự
      allowNull: true // Mặc định là 'null' nếu không 'required'
    }
    
    // 'createdAt' và 'updatedAt' được tự động thêm
    // vì 'timestamps: true' là mặc định trong Sequelize
  }, {
    sequelize,
    modelName: 'FriendRequest',
    // 'timestamps: true' là mặc định, tương đương với Mongoose
    
    // Chuyển đổi các indexes từ Mongoose
    indexes: [
      {
        // Tương đương: friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
        unique: true,
        fields: ['fromUserId', 'toUserId']
      },
      {
        // Tương đương: friendRequestSchema.index({ from: 1 });
        fields: ['fromUserId']
      },
      {
        // Tương đương: friendRequestSchema.index({ to: 1 });
        fields: ['toUserId']
      }
    ]
  });
  return FriendRequest;
};