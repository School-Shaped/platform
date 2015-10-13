module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'Users',
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: DataTypes.DATE
        },
        updatedAt: {
          type: DataTypes.DATE
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false
        },
        fullname: {
    	  	type: DataTypes.STRING,       
        },
        passwordHash: {
    			type: DataTypes.STRING,
          allowNull: false		
        },
        usertype: {
          type: DataTypes.ENUM(0,4),
        },
        UserId: {
          type: DataTypes.BIGINT,
          model: "Users",
          key: "id",
          onUpdate: "CASCADE",
          onDelete: "RESTRICT"
        }
      }
    );
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Users');
  }  
}