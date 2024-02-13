'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var ProductViews = sequelize.define('product_views', 
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
            },
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
    },
    {
        freezeTableName: true,
        tableName: 'product_views',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return ProductViews;
};

