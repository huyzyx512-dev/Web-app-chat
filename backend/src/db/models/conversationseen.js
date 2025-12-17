"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConversationSeen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ConversationSeen.belongsTo(models.Conversation, {
        foreignKey: "conversationId",
        as: "conversation", // Alias khớp với bên trên nếu cần
      });

      ConversationSeen.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  ConversationSeen.init(
    {
      // seenAt: {
      //   type: DataTypes.DATE,
      //   allowNull: false,
      //   defaultValue: DataTypes.NOW,
      // },
    },
    {
      sequelize,
      modelName: "ConversationSeen",
      tableName: "ConversationSeen",
    }
  );
  return ConversationSeen;
};
