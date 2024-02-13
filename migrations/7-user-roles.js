
'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('user_roles', 
      {
          userid: 
          {
              type: Sequelize.INTEGER,
              
              references: 
              {
                 model: 'users',
                 key: 'id'
              } 
              ,primaryKey: true,
          },
            
          /* Checks for root flags. */
          
          root_flags: 
          {
              type: Sequelize.BOOLEAN,
              defaultValue: false
          },

          can_manage: 
          {
              type: Sequelize.BOOLEAN,
              defaultValue: false
          },

          can_assign: 
          {
              type: Sequelize.BOOLEAN,
              defaultValue: false
          },

          can_addmanagers: 
          {
              type: Sequelize.INTEGER,
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
      return queryInterface.dropTable('user_roles');
  }
};
