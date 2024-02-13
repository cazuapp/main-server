'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var OrderDeliver = sequelize.define('order_deliver', 
    {
        orderid: 
        { 
                type: DataTypes.INTEGER,

                references: 
                {
                   model: 'orders',
                   key: 'id'
                }, primaryKey: true,
        },

        driver: 
        { 
             type: DataTypes.INTEGER,
             allowNull: true,

             references: 
             {
                  model: 'users',
                  key: 'id'
             }

        },
            
        status: 
        {
            type: DataTypes.ENUM("ok", "ready", "pending", "notfound", "accident"),
            defaultValue: "pending"
        },

        code:
        {
              allowNull: true,
              type: DataTypes.INTEGER
        },

        reason:
        {
              allowNull: true,
              type: DataTypes.STRING
        },
        
        delivered_at: 
        {
              allowNull: true,
              type: DataTypes.DATE
        }
          
    },
    {
        freezeTableName: true,
        tableName: 'order_deliver',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return OrderDeliver;
};

