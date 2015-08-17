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
        }
        password_hash: {
    			type: DataTypes.STRING,
          allowNull: false		
        }
      }
    ).complete(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Teachers').complete(done);
  }  
}
