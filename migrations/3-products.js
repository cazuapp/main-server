'use strict';

module.exports = 
{
    up: function(queryInterface, Sequelize) 
    {
        return queryInterface.createTable('products', 
        {
            id: 
            {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

          collection: 
          { 
             type: Sequelize.INTEGER,
             allowNull: false,

             references: 
             {
                  model: 'collections',
                  key: 'id'
             }

          },


            type: 
            {
               type: Sequelize.ENUM("unique", "dropdown"),
               allowNull: false
            },


            name:
            {
                type: Sequelize.STRING,
                allowNull: false
            },


            description:
            {
                type: Sequelize.STRING,
                allowNull: true
            },

        deleted:
        {
                type: Sequelize.BOOLEAN,
                allowNull: true,
              defaultValue: false,

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
    return queryInterface.dropTable('products');
  }

};
