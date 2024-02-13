'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('user_locations', 
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
          
          lat:
          {
               type: Sequelize.DOUBLE,
               allowNull: true
          },
          
          lon:
          {
               type: Sequelize.DOUBLE,
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
    return queryInterface.dropTable('user_locations');
  }
  
};

