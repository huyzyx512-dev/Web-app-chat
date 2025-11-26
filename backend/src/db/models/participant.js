"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    static associate(models) {
      // Bảng này là trung gian, nó thuộc về User và Conversation
      Participant.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
      Participant.belongsTo(models.Conversation, {
        foreignKey: "conversationId",
        as: "conversation",
        onDelete: "CASCADE",
      });
    }
  }
  Participant.init(
    {
      // Khóa chính của bảng này
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Khóa ngoại tới Users
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      // Khóa ngoại tới Conversations
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conversations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      // Trường 'joinedAt' từ 'participantSchema'
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Participant",
      timestamps: false, // Thường bảng trung gian không cần createdAt/updatedAt
      indexes: [
        {
          // Chỉ mục cho 'participant.userId' từ Mongoose
          fields: ["userId"],
        },
        {
          // Chỉ mục cho conversationId
          fields: ["conversationId"],
        },
        {
          // Chỉ mục duy nhất để đảm bảo 1 user chỉ join 1 conversation 1 lần
          unique: true,
          fields: ["userId", "conversationId"],
        },
      ],
    }
  );
  return Participant;
};
