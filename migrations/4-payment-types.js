'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('payment_types', 
      {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name:
        {
           type: Sequelize.STRING,
           allowNull: false
        },
        
        global:
        {
             type: Sequelize.BOOLEAN,
             allowNull: true
        },
        
        icon:
        {
             type: Sequelize.STRING,
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
    return queryInterface.dropTable('payment_types');
  }
};

