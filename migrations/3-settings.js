'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('settings', 
      {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        key: 
        {
            type: Sequelize.STRING,
            unique: true,
        },

        value: 
        {
            type: Sequelize.STRING,
        },

        public: 
        {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        
        is_bool: 
        {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },

        createdat: 
        {
            allowNull: false,
            type: Sequelize.DATE
        },

        updatedat: 
        {
            allowNull: false,
            type: Sequelize.DATE
        }

      });
  },

  down: function(queryInterface, Sequelize) 
  {
    return queryInterface.dropTable('settings');
  }
};

