'use strict';

module.exports = 
{
  up: (queryInterface, Sequelize) => 
  {
      return queryInterface.createTable('product_views', 
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

  down: (queryInterface, Sequelize) => 
  {
      return queryInterface.dropTable('product_views');
  }
};

