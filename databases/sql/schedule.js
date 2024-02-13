'use strict';

module.exports = (sequelize, DataTypes) => 
{
    var Schedule = sequelize.define('schedule', 
    {
        monday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },
        
        monday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        monday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },
        
        tuesday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },
        
        tuesday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        tuesday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },
        
        wednesday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },
        
        wednesday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        wednesday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },
        
        thursday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },

        thursday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        thursday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },
            
        friday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },

        friday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        fridayday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        saturday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },

        saturday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        saturday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        sunday:
        {
              type: DataTypes.BOOLEAN,
              defaultValue: true
        },

        sunday_time_start:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

        sunday_time_close:
        {
              type: 'TIMESTAMP',
              allowNull: true
        },

    }, {
        freezeTableName: true,
        tableName: 'schedule',
        createdAt: 'createdat',
        updatedAt: 'updatedat'
    });

    return Schedule;
};
