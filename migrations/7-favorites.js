'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('favorites', 
      {  
          id: 
          {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },

          userid: 
          {
              type: Sequelize.INTEGER,
              
              references: 
              {
                model: 'users',
                key: 'id'
              },
              
          },
          
          product: 
          { 
             type: Sequelize.INTEGER,

             references: 
             {
                  model: 'products',
                  key: 'id'
             }
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
    return queryInterface.dropTable('favorites');
  }
  
};