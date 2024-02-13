'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var UserLogins = sequelize.define('user_logins', 
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
        
        ip: 
        {
             type: DataTypes.STRING,
             allowNull: false
        },

          browser:
          {
               type: DataTypes.STRING(255),
               allowNull: true
          },
          
          version:
          {
               type: DataTypes.STRING(255),
               allowNull: true
          },
          
          os:
          {
               type: DataTypes.STRING(255),
               allowNull: true
          },

          source:
          {
               type: DataTypes.STRING(255),
               allowNull: true
          },

    },
    {
        freezeTableName: true,
        tableName: 'user_logins',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });
    
    return UserLogins;
};


