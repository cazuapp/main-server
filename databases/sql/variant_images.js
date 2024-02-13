'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var VariantImages = sequelize.define('variant_images', 
    {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        
        variant:
        { 
             type: DataTypes.INTEGER,

             references: 
             {
                  model: 'variant',
                  key: 'id'
             }
        },
        
        image: 
        {
             type: DataTypes.STRING,
             allowNull: false,
        },
      
    },
    {
        freezeTableName: true,
        tableName: 'variant_images',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return VariantImages;
};

