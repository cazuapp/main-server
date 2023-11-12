'use strict';
var etc        =  require('../../handlers/etc');

module.exports = (sequelize, DataTypes) => 
{
    var Address = sequelize.define('address', 
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

        is_default:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: false

        },

        name:
        {
              type: DataTypes.STRING,
              allowNull: false
        },

        address: 
        {
             type: DataTypes.STRING,
             allowNull: false
        },

        city: 
        {
             type: DataTypes.STRING
        },

        zip: 
        {
            type: DataTypes.STRING
        },

        aptsuite: 
        {
            type: DataTypes.STRING,
            allowNull: true,
        },

        options: 
        {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ""
        },

        commentary:
        {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ""
        },

        deleted:
        {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        
        
    },
    {
        freezeTableName: true,
        tableName: 'address',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return Address;
};

