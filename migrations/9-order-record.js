'use strict';

module.exports = 
{
  up: function(queryInterface, Sequelize) 
  {
      return queryInterface.createTable('order_record', 
      {  
        orderid: 
        { 
             type: Sequelize.INTEGER,

             references: 
             {
                  model: 'orders',
                  key: 'id'
             }, primaryKey: true,

        },


          address_source: 
          { 
             type: Sequelize.INTEGER,
             allowNull: false,

             references: 
             {
                  model: 'address',
                  key: 'id'
             }
          },

          address_address: 
          { 
             type: Sequelize.STRING,
             allowNull: false,
          },
          
          address_name: 
          { 
             type: Sequelize.STRING,
             allowNull: false,
          },

          address_city: 
          { 
             type: Sequelize.STRING,
             allowNull: false,
          },
          
          address_zip: 
          { 
             type: Sequelize.STRING,
             allowNull: true,
          },
          
          address_aptsuite: 
          { 
             type: Sequelize.STRING,
             allowNull: true,
          },

          address_options: 
          { 
             type: Sequelize.STRING,
             allowNull: true,
          },
          
          address_commentary: 
          { 
             type: Sequelize.STRING,
             allowNull: true,
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
    return queryInterface.dropTable('order_record');
  }
  
};