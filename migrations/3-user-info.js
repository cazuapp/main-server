'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('user_info', 
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
          
          lang:
          {
               type: Sequelize.STRING(10),
               defaultValue: "en"
          },
          
          first: 
          {
               type: Sequelize.STRING(255)
          },
          
          last:
          {
               type: Sequelize.STRING(255)
          },

          /* Active if this used has their account activated. */

          salt: 
          {
              type: Sequelize.STRING
          },

          phone: 
          {
              type: Sequelize.STRING,
              allowNull: true,
          },

          phone_code: 
          {
              type: Sequelize.INTEGER,
              allowNull: true,
          },

          /* Users will not have verified emails by default. */

          verified:
          {
              type: Sequelize.BOOLEAN,
              defaultValue: 0
          },

    });
  },

  down: function(queryInterface, Sequelize) 
  {
    return queryInterface.dropTable('user_info');
  }
  
};

