
/** @type Egg.EggPlugin */
module.exports = {
    // had enabled by egg
    // static: {
    //   enable: true,
    // }
    sequelize: {
        enable: true,
        package: 'egg-sequelize',
    },

    validate: {
        enable: true,
        package: 'egg-validate',
    },

    // 开启模板引擎
    nunjucks: {
        enable: true,
        package: 'egg-view-nunjucks'
    }
}
