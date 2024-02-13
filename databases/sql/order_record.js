'use strict';

module.exports = (sequelize, DataTypes) => {
    var OrderRecord = sequelize.define('order_record', {

        orderid: 
        { 
             type: DataTypes.INTEGER,

             references: 
             {
                  model: 'orders',
                  key: 'id'
             }, primaryKey: true,

        },


        address_source: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: 'address',
                key: 'id'
            }
        },

       address_address: {
            type: DataTypes.STRING,
            allowNull: false
        },

        address_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        address_city: {
            type: DataTypes.STRING,
            allowNull: false
        },

        address_zip: {
            type: DataTypes.STRING,
            allowNull: true
        },

        address_aptsuite: {
            type: DataTypes.STRING,
            allowNull: true
        },

        address_options: {
            type: DataTypes.STRING,
            allowNull: true
        },

        address_commentary: {
            type: DataTypes.STRING,
            allowNull: true
        },

        createdat: {
            allowNull: false,
            type: DataTypes.DATE
        },

        updatedat: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        freezeTableName: true,
        tableName: 'order_record',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });

    return OrderRecord;
};
