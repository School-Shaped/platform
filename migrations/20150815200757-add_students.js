module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'Students',
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
    	  type: DataTypes.STRING,
          allowNull: false	
        },
        TeacherId:  {
          type: DataTypes.BIGINT,
          references: "Teachers",
          referenceKey: "id",
          onUpdate: "CASCADE",
          onDelete: "RESTRICT"
        },
        password_hash: {
    			type: DataTypes.STRING,
          allowNull: false		
        }
      }
    ).complete(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Students').complete(done);
  }  
}
