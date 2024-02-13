'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('user_logins', 
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
          
          ip:
          {
               type: Sequelize.STRING(255),
               allowNull: false
          },

          browser:
          {
               type: Sequelize.STRING(255),
               allowNull: true
          },
          
          version:
          {
               type: Sequelize.STRING(255),
               allowNull: true
          },
          
          os:
          {
               type: Sequelize.STRING(255),
               allowNull: true
          },

          source:
          {
               type: Sequelize.STRING(255),
               allowNull: true
          },


        createdat: 
        {
             allowNull: false,
             type: Sequelize.DATE,

             get()
             {
                  const rawValue = this.getDataValue('createdat');
                  return etc.prettydate(rawValue);
             }
        },

        updatedat: 
        {
             allowNull: false,
             type:  Sequelize.DATE,


             get()
             {
                  const rawValue = this.getDataValue('updatedat');
                  return etc.prettydate(rawValue);
             }

        }

    });
  },

  down: function(queryInterface, Sequelize) 
  {
    return queryInterface.dropTable('user_logins');
  }
  
};
