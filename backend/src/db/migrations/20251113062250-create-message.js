'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Conversations', // Tham chiếu bảng 'Conversations'
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: true, // senderId không nên null, nếu user bị xóa, nên xử lý logic
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL', // Giữ tin nhắn, set sender là NULL
        onUpdate: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imgUrl: {
        type: Sequelize.TEXT,
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

    // Thêm chỉ mục (index) với thứ tự sắp xếp
    await queryInterface.addIndex('Messages', [
      'conversationId',
      {
        attribute: 'createdAt',
        order: 'DESC'
      }
    ], {
      name: 'messages_conversationId_createdAt_desc'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Messages', 'messages_conversationId_createdAt_desc');
    await queryInterface.dropTable('Messages');
  }
};