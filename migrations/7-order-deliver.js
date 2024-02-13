'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
    return queryInterface.createTable('order_deliver', 
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

        driver: 
        { 
             type: Sequelize.INTEGER,
             allowNull: true,

             references: 
             {
                  model: 'users',
                  key: 'id'
             }

        },

        status: 
        {
            type: Sequelize.ENUM("ok", "ready", "pending", "notfound", "accident"),
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

        delivered_at: 
        {
              allowNull: true,
              type: Sequelize.DATE
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
    return queryInterface.dropTable('order_deliver');
  }
  
};
