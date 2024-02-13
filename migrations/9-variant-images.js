'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('variant_images', 
      {  
          id: 
          {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },

          variant: 
          { 
             type: Sequelize.INTEGER,

             references: 
             {
                  model: 'variants',
                  key: 'id'
             }
          },

          image: 
          {
              type: Sequelize.STRING,
              allowNull: false
          },

          rank:
          {
                type: Sequelize.INTEGER,
                defaultValue: 99
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
    return queryInterface.dropTable('variant_images');
  }

};
