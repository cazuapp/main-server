'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var CollectionViews = sequelize.define('collection_views', 
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

        collection: 
        { 
             type: DataTypes.INTEGER,

             references: 
             {
                  model: 'collections',
                  key: 'id'
             }
        },
    },
    {
        freezeTableName: true,
        tableName: 'collection_views',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return CollectionViews;
};

