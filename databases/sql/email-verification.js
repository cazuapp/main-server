'use strict';

module.exports = (sequelize, DataTypes) => {
    var EmailVerify = sequelize.define('email_verification', {
        userid: {
            type: DataTypes.INTEGER,

            references: {
                model: 'users',
                key: 'id'
            },
            primaryKey: true

        },

        code: {
            type: DataTypes.STRING,
            allowNull: false
        },


    }, {
        freezeTableName: true,
        tableName: 'email_verification',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });

    return EmailVerify;
};
