'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Một bản ghi 'Friend' thuộc về hai người dùng.
      // Chúng ta định nghĩa quan hệ từ Friend -> User
      Friend.belongsTo(models.User, {
        foreignKey: 'userAId',
        as: 'userA' // Alias để truy vấn thông tin User A
      });
      Friend.belongsTo(models.User, {
        foreignKey: 'userBId',
        as: 'userB' // Alias để truy vấn thông tin User B
      });

      // Trên model 'User', bạn sẽ định nghĩa quan hệ Many-to-Many
      // thông qua model 'Friend' này.
    }
  }
  Friend.init({
    // Sequelize sẽ tự động thêm 'id' làm khóa chính cho bảng Friend
    userAId: {
      type: DataTypes.INTEGER, // Hoặc DataTypes.UUID nếu User dùng UUID
      allowNull: false,
      references: {
        model: 'Users', // Tên BẢNG (thường là số nhiều)
        key: 'id'
      },
      onDelete: 'CASCADE', // Nếu xóa User, xóa luôn quan hệ bạn bè
      onUpdate: 'CASCADE'
    },
    userBId: {
      type: DataTypes.INTEGER, // Hoặc DataTypes.UUID nếu User dùng UUID
      allowNull: false,
      references: {
        model: 'Users', // Tên BẢNG (thường là số nhiều)
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
    // 'createdAt' và 'updatedAt' (timestamps) được tự động thêm
    // giống với 'timestamps: true' của Mongoose
  }, {
    sequelize,
    modelName: 'Friend',
    // Thêm hooks để tái tạo logic của 'friendSchema.pre("save")'
    hooks: {
      // 'beforeValidate' chạy trước khi kiểm tra (validate) và lưu
      // Đây là nơi lý tưởng để chuẩn hóa dữ liệu
      beforeValidate: (friend, options) => {
        // Đảm bảo userAId luôn nhỏ hơn hoặc bằng userBId
        if (friend.userAId > friend.userBId) {
          // Hoán đổi giá trị
          const tempId = friend.userAId;
          friend.userAId = friend.userBId;
          friend.userBId = tempId;
        }
      }
    },
    // Thêm chỉ mục (index) duy nhất
    indexes: [
      {
        unique: true,
        fields: ['userAId', 'userBId'] // Tên cột trong bảng SQL
      }
    ]
  });
  return Friend;
};