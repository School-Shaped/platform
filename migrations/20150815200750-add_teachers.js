module.exports = {
  up: function(queryInterface, Sequelize) {
    queryInterface.createTable(
      'Users',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false
        },
        fullname: {
    	  	type: Sequelize.STRING,       
        },
        passwordHash: {
    			type: Sequelize.STRING,
          allowNull: false		
        },
        usertype: {
          type: Sequelize.ENUM('Teacher','Student','Builder','Administrator','Other'),
        },
        UserId: {
          type: Sequelize.BIGINT,
          model: "Users",
          key: "id",
          onUpdate: "CASCADE",
          onDelete: "RESTRICT"
        }
      }
    );
  },
  down: function(queryInterface, Sequelize) {
    queryInterface.dropTable('Users');
  }  
}