'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Location = sequelize.define('user_locations', 
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
        
        lat:
        {
                type: DataTypes.DOUBLE,
                allowNull: true
        },
        
        lon:
        {
                type: DataTypes.DOUBLE,
                allowNull: true
        },
         
    },
    {
        freezeTableName: true,
        tableName: 'user_locations',
        createdAt: 'createdat',
        updatedAt: 'updatedat'

    });
    
    return Location;
};

