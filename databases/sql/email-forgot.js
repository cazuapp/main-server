'use strict';

module.exports = (sequelize, DataTypes) => {
    var EmailForgot = sequelize.define('email_forgot', {
         
          id: 
          {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: DataTypes.INTEGER
          },
          
          email:
          {
               type: DataTypes.STRING,
               allowNull: false
          },


        code: {
            type: DataTypes.STRING,
            allowNull: false
        },


    }, {
        freezeTableName: true,
        tableName: 'email_forgot',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });

    return EmailForgot;
};
