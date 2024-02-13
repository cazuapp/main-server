'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Collects = sequelize.define('collections', 
    {
        id: 
        {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: DataTypes.INTEGER
        },
        
        title: 
        {
             type: DataTypes.STRING,
             allowNull: true,
        },

        imagesrc: 
        {
             type: DataTypes.STRING,
             allowNull: true,
        },

        active:
        {
             type: DataTypes.INTEGER,
             defaultValue: 1
        },

        piority:
        {
              type: DataTypes.INTEGER,
              defaultValue: 1
        },

        deleted:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: false
        },

    },
    {
        freezeTableName: true,
        tableName: 'collections',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });

    return Collects;
};

