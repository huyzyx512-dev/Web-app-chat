'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Participants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Conversations',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
      // Không có 'createdAt' và 'updatedAt' vì model_def_ không có 'timestamps: true'
    });

    // Thêm các chỉ mục
    await queryInterface.addIndex('Participants', ['userId', 'conversationId'], {
      unique: true,
      name: 'participants_userId_conversationId_unique'
    });
    await queryInterface.addIndex('Participants', ['userId']);
    await queryInterface.addIndex('Participants', ['conversationId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Participants', 'participants_userId_conversationId_unique');
    await queryInterface.removeIndex('Participants', ['userId']);
    await queryInterface.removeIndex('Participants', ['conversationId']);

    await queryInterface.dropTable('Participants');
  }
};