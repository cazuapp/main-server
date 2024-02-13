
'use strict';

module.exports = 
{
    up: function(queryInterface, Sequelize) 
    {
        return queryInterface.createTable('bans', 
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
               type: Sequelize.ENUM("badbehavior", "badaction"),
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
    return queryInterface.dropTable('bans');
  }

};