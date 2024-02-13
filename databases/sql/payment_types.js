'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var PaymentTypes = sequelize.define('payment_types', 
    {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        name: 
        {
            type: DataTypes.STRING,
            allowNull: true,
        },

        icon:
        {
             type: DataTypes.STRING,
             allowNull: true
        },

        global:
        {
             type: DataTypes.BOOLEAN,
             allowNull: true
        },

    },
    {
        freezeTableName: true,
        tableName: 'payment_types',
        createdAt: 'createdat',
        updatedAt: 'updatedat',
    });
    
    return PaymentTypes;
};

