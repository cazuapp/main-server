'use strict';
var etc        =  require('../../handlers/etc');

module.exports = (sequelize, DataTypes) => 
{
    var Orders = sequelize.define('orders', 
    {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        
        userid:
        { 
             type: DataTypes.INTEGER,

             references: 
             {
                  model: 'users',
                  key: 'id'
             }
        },

        address: 
        {
             type: DataTypes.INTEGER,
             allowNull: false,

             references: 
             {
                   model: 'address',
                   key: 'id'
             },
        },
        
        createdat: 
        {
             allowNull: false,
             type: DataTypes.DATE,
             
             get()
             {
                  const rawValue = this.getDataValue('createdat');
                  return etc.prettydate(rawValue);
             }

        },

        updatedat: 
        {
             allowNull: false,
             type:  DataTypes.DATE,
      
              
             get()
             {
                  const rawValue = this.getDataValue('updatedat');
                  return etc.prettydate(rawValue);
             }
        },
        
        raw_created: 
        {
             allowNull: true,
             type:  DataTypes.VIRTUAL,


             get()
             {
                  return this.getDataValue('updatedat');
             }

        }

    },
    {
        freezeTableName: true,
        tableName: 'orders',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return Orders;
};

