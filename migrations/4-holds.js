
'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('holds', 
      {
        userid: 
        {
            type: Sequelize.INTEGER,
            
            references: 
            {
                model: 'users',
                key: 'id'
            }, primaryKey: true,
        },

        able_to_order: 
        {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        
        health: 
        {
            type: Sequelize.BOOLEAN,
            defaultValue: true
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
    return queryInterface.dropTable('holds');
  }
};