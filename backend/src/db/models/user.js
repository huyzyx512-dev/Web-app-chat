'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. User và Conversation (Quan hệ Một-Nhiều, người tạo nhóm)
      User.hasMany(models.Conversation, {
        foreignKey: 'createdByUserId',
        as: 'createdGroups'
      });

      // 2. User và Conversation (Quan hệ Nhiều-Nhiều, participants)
      User.belongsToMany(models.Conversation, {
        through: models.Participant,
        foreignKey: 'userId', // Khóa ngoại của User trong bảng trung gian Participant
        otherKey: 'conversationId',
        as: 'conversations' // Lấy tất cả các cuộc trò chuyện mà user tham gia
      });

      // 3. User và Conversation (Quan hệ Nhiều-Nhiều, seenByUsers)
      User.belongsToMany(models.Conversation, {
        through: 'ConversationSeen', // Tên bảng trung gian
        foreignKey: 'userId',
        otherKey: 'conversationId',
        as: 'seenConversations' // Lấy tất cả các cuộc trò chuyện mà user đã xem
      });

      // 4. User và Friend (Quan hệ Tự tham chiếu/Nhiều-Nhiều không đối xứng)
      // Người dùng có thể là userA hoặc userB trong bảng Friends
      User.belongsToMany(models.User, {
        through: models.Friend,
        as: 'friendsA', // Khi User này là userA
        foreignKey: 'userAId',
        otherKey: 'userBId'
      });
      User.belongsToMany(models.User, {
        through: models.Friend,
        as: 'friendsB', // Khi User này là userB
        foreignKey: 'userBId',
        otherKey: 'userAId'
      });

      // 5. User và FriendRequest (Quan hệ Một-Nhiều, người gửi)
      User.hasMany(models.FriendRequest, {
        foreignKey: 'fromUserId',
        as: 'sentRequests'
      });

      // 6. User và FriendRequest (Quan hệ Một-Nhiều, người nhận)
      User.hasMany(models.FriendRequest, {
        foreignKey: 'toUserId',
        as: 'receivedRequests'
      });
      
      // 7. User và Message (Quan hệ Một-Nhiều, người gửi tin nhắn)
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'messages'
      });
    }
  }
  User.init({
    userName: DataTypes.STRING,
    password: DataTypes.TEXT,
    email: DataTypes.STRING,
    displayName: DataTypes.STRING,
    avatarUrl: DataTypes.TEXT,
    avatarId: DataTypes.STRING,
    bio: DataTypes.STRING,
    phone: DataTypes.STRING,
    usersCol: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};