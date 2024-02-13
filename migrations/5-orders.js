'use strict';

module.exports = 
{
  up: (queryInterface, Sequelize) => 
  {
      return queryInterface.createTable('orders', 
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
              }
          },

          address: 
          {
                type: Sequelize.INTEGER,
                allowNull: false,

                references: 
                {
                   model: 'address',
                   key: 'id'
                },
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
      return queryInterface.dropTable('orders');
  }
};

