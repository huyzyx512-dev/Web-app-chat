'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Conversations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('direct', 'group'),
        allowNull: false
      },
      groupName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdByUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', // Tên bảng (số nhiều)
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastMessageContent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lastMessageSenderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      lastMessageCreatedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      unreadCounts: {
        type: Sequelize.JSON, // Hoặc JSONB
        allowNull: false,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW') // Thêm giá trị mặc định
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Thêm chỉ mục (index)
    await queryInterface.addIndex('Conversations', ['lastMessageAt']);
  },
  async down(queryInterface, Sequelize) {
    // Xóa index trước (mặc dù dropTable cũng sẽ xóa)
    await queryInterface.removeIndex('Conversations', ['lastMessageAt']);
    await queryInterface.dropTable('Conversations');
  }
};