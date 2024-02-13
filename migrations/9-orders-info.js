'use strict';

module.exports = 
{
    up: function(queryInterface, Sequelize) 
    {
        return queryInterface.createTable('orders_info', 
        {
            id: 
            {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            
            orderid: 
            { 
                type: Sequelize.INTEGER,

                references: 
                {
                   model: 'orders',
                   key: 'id'
                }, primaryKey: true,
            },

            variant_historic: 
            {
                type: Sequelize.STRING,
                allowNull: false,
            },
            
            variant: 
            {
                type: Sequelize.INTEGER,
                allowNull: false,

                references: 
                {
                   model: 'variants',
                   key: 'id'
                },
            },
            
            quantity:
            {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
          
            total:
            {
                type: Sequelize.DOUBLE,
                defaultValue: 0
            },
            
            total_unit:
            {
                type: Sequelize.DOUBLE,
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
    return queryInterface.dropTable('orders_info');
  }

};
          
            