'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var OrderPayment = sequelize.define('order_payments', 
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
            
        payment_type: 
        { 
              type: DataTypes.INTEGER,
              allowNull: false,
             
             references: 
             {
                  model: 'payment_types',
                  key: 'id'
             },
        },

        status: 
        {
            type: DataTypes.ENUM("ok", "pending", "notpaid", "nofunds"),
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
        tableName: 'order_payments',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return OrderPayment;
};

