'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('email_forgot', 
    {
          id: 
          {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },
          
          email:
          {
               type: Sequelize.STRING,
               allowNull: false
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
    return queryInterface.dropTable('email_forgot');
  }
  
};

