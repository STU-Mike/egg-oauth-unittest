// app/controller/post.js
const Controller = require('egg').Controller


class UserController extends Controller {

    /**
     * 汕头大学校园网账号密码登录
     * @returns {Promise<void>}
     */
    async getUserInfo() {
        const ctx = this.ctx
        ctx.body = {
            user: {
                id: ctx.user.id,
                info: ctx.user.info
            }
        }
    }

}

module.exports = UserController
