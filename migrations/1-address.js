'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('address', 
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

          is_default:
          {
              type: Sequelize.BOOLEAN,
              defaultValue: false
          },
          
          name:
          {
              type: Sequelize.STRING,
              allowNull: false
              
          },

          address: 
          {
              type: Sequelize.STRING,
              allowNull: false
          },
          
          city: 
          {
              type: Sequelize.STRING
          },
          
          zip: 
          {
              type: Sequelize.STRING
          },

          aptsuite: 
          {
              type: Sequelize.STRING,
              defaultValue: "",
              allowNull: true,
          },

          options: 
          {
              type: Sequelize.STRING,
              defaultValue: "",
              allowNull: true,
          },

          commentary:
          {
              type: Sequelize.STRING,
              defaultValue: "",
              allowNull: true,
          },

          deleted:
          {
              type: Sequelize.BOOLEAN,
              defaultValue: false
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
    return queryInterface.dropTable('address');
  }
  
};