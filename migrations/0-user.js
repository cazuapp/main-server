'use strict';

module.exports = 
{
  up: (queryInterface, Sequelize) => 
  {
      return queryInterface.createTable('users', 
      {
          id: 
          {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },

          email: 
          {
            allowNull: false,
            trim: true,
           
              type: Sequelize.STRING(255),
              unique: true
          },
          
          password: 
          {
              type: Sequelize.STRING,
              allowNull: false
          },
          
          active:
          {
             type: Sequelize.BOOLEAN,
             defaultValue: true,
             allowNull: false
          },
          
          createdat: 
          {
              allowNull: true,
              type: Sequelize.DATE,
              
          },

          updatedat: 
          {
              allowNull: true,
              type: Sequelize.DATE
          }
          

      });
  },

  down: (queryInterface, Sequelize) => 
  {
      return queryInterface.dropTable('users');
  }
};


