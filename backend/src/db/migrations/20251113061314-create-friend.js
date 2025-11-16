'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Friends', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userAId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      userBId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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

    // Thêm chỉ mục UNQUE
    await queryInterface.addIndex('Friends', ['userAId', 'userBId'], {
      unique: true,
      name: 'friends_userAId_userBId_unique' // Tên cho chỉ mục unique
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Friends', 'friends_userAId_userBId_unique');
    await queryInterface.dropTable('Friends');
  }
};