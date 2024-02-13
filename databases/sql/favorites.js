'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Favorites = sequelize.define('favorites', 
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
        tableName: 'favorites',
        createdAt: 'createdat',
        updatedAt: 'updatedat'

    });
    
    return Favorites;
};

