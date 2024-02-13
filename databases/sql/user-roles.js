'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Roles = sequelize.define('user_roles', 
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
        
          root_flags: 
          {
              type: DataTypes.INTEGER,
              defaultValue: 0
          },

          can_manage: 
          {
              type: DataTypes.BOOLEAN,
              defaultValue: false
          },

          can_assign: 
          {
              type: DataTypes.BOOLEAN,
              defaultValue: false
          },

          can_addmanagers: 
          {
              type: DataTypes.BOOLEAN,
              defaultValue: false
          },

    },
    {
        freezeTableName: true,
        tableName: 'user_roles',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });
    
    return Roles;
};

