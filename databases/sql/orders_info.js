'use strict';
var etc        =  require('../../handlers/etc');

module.exports = (sequelize, DataTypes) => 
{
    var OrderInfo = sequelize.define('orders_info', 
    {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        
        orderid: 
        { 
                type: DataTypes.INTEGER,

                references: 
                {
                   model: 'orders',
                   key: 'id'
                }, primaryKey: true,
        },

        variant_historic: 
        {
             type: DataTypes.STRING,
             allowNull: false,
        },

        variant: 
        {
             type: DataTypes.INTEGER,
             allowNull: false,

             references: 
             {
                   model: 'variants',
                   key: 'id'
             },
        },
            
        quantity:
        {
             type: DataTypes.INTEGER,
             defaultValue: 0
        },
          
        total:
        {
             type: DataTypes.DOUBLE,
             defaultValue: 0,

             get()
             {
                  const rawValue = this.getDataValue('total');
                  return etc.round2(rawValue);
             }
             
        },

        total_unit:
        {
             type: DataTypes.DOUBLE,
             defaultValue: 0,
             

             get()
             {
                  const rawValue = this.getDataValue('total');
                  return etc.round2(rawValue);
             }
             
        },
        
        createdat: 
        {
             allowNull: false,
             type: DataTypes.DATE,
             
        },

        updatedat: 
        {
             allowNull: false,
             type:  DataTypes.DATE,
      
        }

    },
    {
        freezeTableName: true,
        tableName: 'orders_info',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return OrderInfo;
};

