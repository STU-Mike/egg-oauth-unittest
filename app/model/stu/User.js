module.exports = app => {
    const { STRING, JSON } = app.Sequelize

    return app.model.define('User', {
        id: {
            type: STRING(32),
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        info: JSON
    }, {
        tableName: 'user', // oauth_users
        timestamps: true,
        underscored: true,
    })
}
