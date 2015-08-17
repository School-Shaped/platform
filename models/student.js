module.exports = function(sequelize, DataTypes) {
    var Student = sequelize.define('Student', {
        username: DataTypes.STRING,
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Student.belongsTo(models.Teacher);
            }
        }
    })

    return Student
}
