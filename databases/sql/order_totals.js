'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var OrderTotals = sequelize.define('order_totals', 
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
            
        shipping:
        {
                type: DataTypes.DOUBLE,
                allowNull: false
        },
        
        total:
        {
                type: DataTypes.DOUBLE,
                allowNull: false

        },

        total_tax:
        {
                type: DataTypes.DOUBLE,
                allowNull: false

        },

        total_tax_shipping:
        {
                type: DataTypes.DOUBLE,
                allowNull: false

        },
        
        tip:
        {
                type: DataTypes.DOUBLE,
                allowNull: true
        },
          
    },
    {
        freezeTableName: true,
        tableName: 'order_totals',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return OrderTotals;
};

