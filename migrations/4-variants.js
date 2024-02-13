'use strict';

module.exports = 
{
    up: function(queryInterface, Sequelize) 
    {
        return queryInterface.createTable('variants', 
        {
            id: 
            {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
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

            
             price:
            {
                type: Sequelize.FLOAT,
                allowNull: false,
            },

            deleted:
            {
               type: Sequelize.BOOLEAN,
               defaultValue: false,
               allowNull: true
            },

          title: 
          {
                 type: Sequelize.STRING,
                 allowNull: true,
          },


          value: 
          {
                 type: Sequelize.STRING,
                 allowNull: true,
          },

          stock:
          {
                type: Sequelize.INTEGER,
                defaultValue: -1
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
    return queryInterface.dropTable('variants');
  }

};
          
            