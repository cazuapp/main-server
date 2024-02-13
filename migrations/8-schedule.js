
'use strict';

module.exports = 
{
    up: function(queryInterface, Sequelize) 
    {
        return queryInterface.createTable('schedule', 
        {
            monday:
            {
                type: Sequelize.BOOLEAN,
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
                type: Sequelize.BOOLEAN,
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
                type: Sequelize.BOOLEAN,
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
                type: Sequelize.BOOLEAN,
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
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },

            friday_time_start:
            {
                type: 'TIMESTAMP',
                allowNull: true
            },

            friday_time_close:
            {
                type: 'TIMESTAMP',
                allowNull: true
            },
            
            saturday:
            {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },

            saturday_time_start:
            {
                type: 'TIMESTAMP',
                allowNull: true
            },
            
            saturday_time_stop:
            {
                type: 'TIMESTAMP',
                allowNull: true
            },

            
            sunday:
            {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },

            sunday_time_start:
            {
                type: 'TIMESTAMP',
                allowNull: true
            },
            
            sunday_time_stop:
            {
                type: 'TIMESTAMP',
                allowNull: true
            },
            

            createdat: 
            {
                allowNull: false,
                type: Sequelize.DATE
            },

            updatedat: 
            {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
  },

  down: function(queryInterface, Sequelize) 
  {
    return queryInterface.dropTable('schedule');
  }

};