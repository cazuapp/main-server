'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('order_totals', 
    {
         orderid: 
         { 
             type: Sequelize.INTEGER,

             references: 
             {
                  model: 'orders',
                  key: 'id'
             }, primaryKey: true,

         },

        shipping:
        {
                type: Sequelize.DOUBLE,
                allowNull: false
        },
        
        total:
        {
                type: Sequelize.DOUBLE,
                allowNull: false

        },

        total_tax:
        {
                type: Sequelize.DOUBLE,
                allowNull: false

        },

        total_tax_shipping:
        {
                type: Sequelize.DOUBLE,
                allowNull: false

        },
        
        tip:
        {
                type: Sequelize.DOUBLE,
                allowNull: true
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
    return queryInterface.dropTable('order_totals');
  }
  
};
