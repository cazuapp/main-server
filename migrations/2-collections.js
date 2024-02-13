'use strict';

module.exports = 
{
    up: function(queryInterface, Sequelize) 
    {
        return queryInterface.createTable('collections', 
        {
            id: 
            {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            title:
            {
                type: Sequelize.STRING,
                allowNull: true,
            },

            imagesrc:
            {
                type: Sequelize.STRING,
                allowNull: true
            },

            active:
            {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            
            piority:
            {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },

          deleted:
          {
              type: Sequelize.BOOLEAN,
              defaultValue: false
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
    return queryInterface.dropTable('collections');
  }

};