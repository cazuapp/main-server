'use strict';

module.exports = (sequelize, DataTypes) => 
{
  var Settings = sequelize.define('settings', 
  {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        key: 
        {
            type: DataTypes.STRING,
            unique: true,

            validate: 
            {
                set  : function(val) 
                {
                    this.setDataValue('key', val.toLowerCase());
                }
            }
            
        },

        value: 
        {
            type: DataTypes.STRING,
        },

        public: 
        {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },

        is_bool: 
        {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },

        

  },
  {
    freezeTableName: true,
    tableName: 'settings',
    createdAt: 'createdat',
    updatedAt: 'updatedat'

});

  return Settings;
};
