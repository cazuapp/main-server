'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('order_status', 
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

        status: 
        {
            type: Sequelize.ENUM("ok", "pending", "nopayment", "nodriver", "cancelled", "other"),
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
    return queryInterface.dropTable('order_status');
  }
  
};
