'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('email_verification', 
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
          
          code:
          {
               type: Sequelize.STRING,
               allowNull: false
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
    return queryInterface.dropTable('email_verification');
  }
  
};

