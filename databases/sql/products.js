'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Products = sequelize.define('products', 
    {
        id: 
        {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: DataTypes.INTEGER
        },
        
        collection: 
        { 
             type: DataTypes.INTEGER,
             allowNull: false,

             references: 
             {
                  model: 'collections',
                  key: 'id'
             }

          },


        name:
        {
               type: DataTypes.STRING,
               allowNull: false
        },

        type: 
        {
             type: DataTypes.ENUM("unique", "dropdown"),
             allowNull: true
        }, 


        description:
        {
                type: DataTypes.STRING,
                allowNull: true
        },


        deleted:
        {
                type: DataTypes.BOOLEAN,
                allowNull: true,
              defaultValue: false,

        },

    },
    {
        freezeTableName: true,
        tableName: 'products',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });

    return Products;
};

