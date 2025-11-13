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
      // define association here
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