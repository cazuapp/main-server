'use strict';

module.exports = 
{
  up: (queryInterface, Sequelize) => 
  {
      return queryInterface.createTable('collection_views', 
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

        collection: 
        { 
             type: Sequelize.INTEGER,

             references: 
             {
                  model: 'collections',
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
      return queryInterface.dropTable('collection_views');
  }
};

