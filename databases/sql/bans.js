'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Bans = sequelize.define('bans', 
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

        code:
        {
            allowNull: true,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        updatedat: 
        {
             allowNull: false,
             type:  DataTypes.DATE,
        },

        createdat: 
        {
             allowNull: false,
             type: DataTypes.DATE,

        },

    },
   
    {
        freezeTableName: true,
        tableName: 'bans',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
        
    });

    return Bans;
};

