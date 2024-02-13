'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('preferences', 
      {
        id: 
        {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        userid: 
        { 
             type: Sequelize.INTEGER,

             references: 
             {
                  model: 'users',
                  key: 'id'
             }, 
        },

        key: 
        {
            type: Sequelize.STRING,
            allowNull: false,
            
        },

        value: 
        {
            type: Sequelize.STRING,
            allowNull: false,
            
        },

        createdat: 
        {
             allowNull: false,
             type: Sequelize.DATE,

             get()
             {
                  const rawValue = this.getDataValue('createdat');
                  return etc.prettydate(rawValue);
             }
        },

        updatedat: 
        {
             allowNull: false,
             type:  Sequelize.DATE,


             get()
             {
                  const rawValue = this.getDataValue('updatedat');
                  return etc.prettydate(rawValue);
             }

        }


      });
  },

  down: function(queryInterface, Sequelize) 
  {
    return queryInterface.dropTable('preferences');
  }
};

