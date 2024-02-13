
'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('drivers', 
      {
        userid: 
        {
            type: Sequelize.INTEGER,
            
            references: 
            {
                model: 'users',
                key: 'id'
            },               primaryKey: true,

        },

        available: 
        {
            type: Sequelize.BOOLEAN,
            defaultValue: 0
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
    return queryInterface.dropTable('drivers');
  }
};