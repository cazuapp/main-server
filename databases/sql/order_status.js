'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var OrderStatus = sequelize.define('order_status', 
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
            
        status: 
        {
             type: DataTypes.ENUM("ok", "pending", "nopayment", "nodriver", "cancelled", "other"),
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
          
    },
    {
        freezeTableName: true,
        tableName: 'order_status',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return OrderStatus;
};

