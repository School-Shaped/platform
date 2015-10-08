module.exports = function(sequelize, DataTypes) {
    var Appl = sequelize.define('Application', {
        title: DataTypes.STRING,
        builders: DataTypes.STRING,
        stakeholders: DataTypes.STRING,
        url: DataTypes.STRING,
        description: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                // Appl.belongsToMany(models.User)
            }
        }
    })

    return Appl
}