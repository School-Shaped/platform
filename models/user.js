module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        passwordHash: DataTypes.STRING,
        usertype: DataTypes.ENUM(0,4),
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