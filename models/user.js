module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        passwordHash: DataTypes.STRING,
        usertype: DataTypes.ENUM('Teacher','Student','Builder','Administrator','Other'),
        fullname: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                User.belongsToMany(User, { as: 'Students', through: 'TeacherStudent', foreignKey: 'StudentId' });
                User.belongsToMany(User, { as: 'Teachers', through: 'TeacherStudent', foreignKey: 'TeacherId' });
                User.belongsToMany(models.App, { as: 'Apps', through: 'AppUser', foreignKey: 'UserId' });
                User.belongsToMany(models.App, { as: 'Apps', through: 'AppUser', foreignKey: 'CreatorId' });
            }
        }
    })

    return User
}