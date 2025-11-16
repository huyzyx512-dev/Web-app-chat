'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Phương thức 'up' tạo bảng Users
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: true // Dựa trên model, mặc định là true
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatarUrl: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatarId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      usersCol: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  /**
   * Phương thức 'down' xóa bảng Users
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};