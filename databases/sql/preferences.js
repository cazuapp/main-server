'use strict';

var etc        =  require('../../handlers/etc');

module.exports = (sequelize, DataTypes) => 
{
    var Preferences = sequelize.define('preferences', 
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
        
        key: 
        {
            type: DataTypes.STRING,
            allowNull: false,
            
            validate: 
            {
                set  : function(val) 
                {
                    this.setDataValue('key', val.toLowerCase());
                }
            }
            
        },

        value: 
        {
            type: DataTypes.STRING,
            allowNull: false,
        },
        
        createdat: 
        {
             allowNull: false,
             type: DataTypes.DATE,
             
        },

        updatedat: 
        {
             allowNull: false,
             type:  DataTypes.DATE,
      

        },
        

    },
    {
        freezeTableName: true,
        tableName: 'preferences',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return Preferences;
};

