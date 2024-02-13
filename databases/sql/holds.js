'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Holds = sequelize.define('holds', 
    {
        userid: 
        { 
           type: DataTypes.INTEGER,

           references: 
           {
              model: 'users',
              key: 'id'
           }, primaryKey: true,

        },

        able_to_order:
        {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        
        health:
        {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

    },
   
    {
        freezeTableName: true,
        tableName: 'holds',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
        
    });

    return Holds;
};

