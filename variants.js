'use strict';
var etc        =  require('../../handlers/etc');

module.exports = (sequelize, DataTypes) => 
{
    var Variants = sequelize.define('variants', 
    {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        
        product:
        { 
             type: DataTypes.INTEGER,

             references: 
             {
                  model: 'products',
                  key: 'id'
             }
        },
        
    
        price:
        {
             type: DataTypes.FLOAT,
             allowNull: false,

            validate: 
            {
                set  : function(val) 
                {
                    this.setDataValue('price', etc.round2(val));
                }
            }
             
             
        },
        
        deleted:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: false,
              allowNull: true
        },

        title: 
        {
                 type: DataTypes.STRING,
                 allowNull: true,
        },

        value: 
        {
                 type: DataTypes.STRING,
                 allowNull: true,
        },

        rank:
        {
                type: DataTypes.INTEGER,
                defaultValue: 99
        },

        stock: 
        {
                 type: DataTypes.INTEGER,
                 defaultValue: -1
        },
      
    },
    {
        freezeTableName: true,
        tableName: 'variants',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return Variants;
};

