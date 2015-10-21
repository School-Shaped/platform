module.exports = function(sequelize, DataTypes) {
    var App = sequelize.define('App', {
        name: DataTypes.STRING,    
        url: DataTypes.STRING,
        description: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                App.belongsToMany(models.User, { as: 'Users', through: 'AppCreator', foreignKey: 'AppId' });
                App.belongsToMany(models.User, { as: 'Creators', through: 'AppUser', foreignKey: 'AppId' });
            }
        }
    })

    return App
}