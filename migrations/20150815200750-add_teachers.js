module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'Teachers',
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
        name: {
    	  	type: DataTypes.STRING          
        },
        passwordHash: {
    			type: DataTypes.STRING,
          allowNull: false		
        }
      }
    );
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Teachers');
  }  
}
