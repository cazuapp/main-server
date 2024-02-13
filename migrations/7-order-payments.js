'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('order_payments', 
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

        payment_type: 
        { 
             type: Sequelize.INTEGER,
              allowNull: false,
             
             references: 
             {
                  model: 'payment_types',
                  key: 'id'
             },

        },

        status: 
        {
            type: Sequelize.ENUM("ok", "pending", "notpaid", "nofunds"),
            defaultValue: "pending"
        },

        code:
        {
              allowNull: true,
              type: Sequelize.INTEGER

        },

        reason:
        {
              allowNull: true,
              type: Sequelize.STRING
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
    return queryInterface.dropTable('order_payments');
  }
  
};
