// app/service/oauth.js
const Service = require('egg').Service

class StuService extends Service {
    async updateUser(user_id, account, password) {
        let { ctx, app } = this
        let userModel
        try {
            userModel = await ctx.model.Stu.User.findOne({
                where: { id: user_id }
            })
            if (!userModel) {
                userModel = await ctx.model.Stu.Password.create({
                    id: user_id,
                    password: ctx.helper.aesEncrypt({
                        data: password,
                        key: this.config.pwKey,
                        iv: this.config.pwIv
                    }),
                    user: {
                        id: user_id,
                        account: account
                    }
                }, {
                    include: [{
                        association: ctx.model.Stu.Password.User,
                    }]
                })
            }
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.StuService.update_user_error)
        }
        return userModel.toJSON().id
    }
}

module.exports = StuService
