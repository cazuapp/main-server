'use strict';
var etc        =  require('../../handlers/etc');

module.exports = (sequelize, DataTypes) => 
{
    var User = sequelize.define('users', 
    {
        id: 
        {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: DataTypes.INTEGER
        },
        
        email: 
        {
            allowNull: false,
            type: DataTypes.STRING(255),
            unique: true,
            trim: true,

            /* Emails MUST always be saved in lowercase. */

            validate: 
            {
                set  : function(val) 
                {
                    this.setDataValue('email', val.toLowerCase());
                }
            }

        },

        active: 
        {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },

        password: 
        {
             type: DataTypes.STRING,
             allowNull: false
        },

          createdat: 
          {
              allowNull: true,
              type: DataTypes.DATE,
              
          },

        created: 
        {
             type:  DataTypes.VIRTUAL,

             get()
             {
             return "leo";
                  const data = instance.get()

                  const rawValue = instance.get('createdat');
                  return etc.prettydate(rawValue);
             }

        },

          updatedat: 
          {
              allowNull: true,
              type: DataTypes.DATE
          }

    },
    {
        freezeTableName: true,
        tableName: 'users',
        createdAt: 'createdat',
        updatedAt: 'updatedat'

    });
    
    return User;
};


