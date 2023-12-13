'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Driver = sequelize.define('drivers', 
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
        
        available:
        {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },

    },
    {
        freezeTableName: true,
        tableName: 'drivers',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });
    
    return Driver;
};

