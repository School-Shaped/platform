module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        passwordHash: DataTypes.STRING,
        usertype: DataTypes.ENUM('Teacher','Student','Builder','Administrator','Other'),
        fullname: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.User, {foreignKey: "UserId"});
                User.belongsTo(models.User);
            }
        }
    })

    return User
}