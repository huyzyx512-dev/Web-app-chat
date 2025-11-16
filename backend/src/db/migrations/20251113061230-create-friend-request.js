'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FriendRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fromUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      toUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      message: {
        type: Sequelize.STRING(300), // Giới hạn 300 ký tự
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

    // Thêm các chỉ mục (indexes)
    await queryInterface.addIndex('FriendRequests', ['fromUserId', 'toUserId'], {
      unique: true,
      name: 'friendrequests_from_to_unique'
    });
    await queryInterface.addIndex('FriendRequests', ['fromUserId']);
    await queryInterface.addIndex('FriendRequests', ['toUserId']);
  },
  async down(queryInterface, Sequelize) {
    // Xóa các chỉ mục
    await queryInterface.removeIndex('FriendRequests', 'friendrequests_from_to_unique');
    await queryInterface.removeIndex('FriendRequests', ['fromUserId']);
    await queryInterface.removeIndex('FriendRequests', ['toUserId']);
    
    await queryInterface.dropTable('FriendRequests');
  }
};