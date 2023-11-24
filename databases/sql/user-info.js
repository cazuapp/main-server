'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var UserExtend = sequelize.define('user_info', 
    {
        userid: 
        {
            type: DataTypes.INTEGER,

            references: 
            {
                model: 'users',
                key: 'id'
            },
            primaryKey: true
        },

        first: 
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        lang: 
        {
            type: DataTypes.STRING(10),
            defaultValue: "en"
        },

        last: 
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        /* Active if this used has their account activated. */

        salt: 
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        phone: 
        {
            type: DataTypes.STRING,
            allowNull: true
        },

        phone_code: 
        {
            type: DataTypes.INTEGER
        },

        /* Users will not have verified emails by default. */

        verified: 
        {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        
        
        fullname: 
        {
             type:  DataTypes.VIRTUAL,


             get()
             {
                 return `${this.first} ${this.last}`;
             }

        },
        

    }, {
        freezeTableName: true,
        tableName: 'user_info',
        timestamps: false
    });

    return UserExtend;
};
