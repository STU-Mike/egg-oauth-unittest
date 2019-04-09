// app/controller/post.js
const Controller = require('egg').Controller

class OauthController extends Controller {

    /**
     * 汕头大学校园网账号密码登录
     * @returns {Promise<void>}
     */
    async login() {
        const ctx = this.ctx
        const app = this.app

        try {
            this.ctx.validate({
                account: { type: 'string' },
                password: { type: 'string' },
            })
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.OauthController.params_error)
        }
        let account = ctx.request.body.account
        let password = ctx.request.body.password
        // 设置session，授权码的会用到
        ctx.session.user_id = await ctx.service.oauth.stuLogin(account, password)
        ctx.body = {}
    }

    /**
     * Oauth2.0 获取授权码接口
     * @returns {Promise<void>}
     */
    async authorizationCode() {
        const { ctx, app, config } = this

        try {
            this.ctx.validate({
                response_type: { type: 'string' },
                client_id: { type: 'string' },
                redirect_uri: { type: 'string?' },
                state: { type: 'string', required: false },
                scope: { type: 'string', required: false },
                from: 'string?'
            }, ctx.query)
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.OauthController.params_error)
        }
        if (!ctx.query.redirect_uri) {
            // APP 无需redirect_uri，仅用于用于绕过Oauth验证，该URL无意义
            ctx.request.query.redirect_uri = this.config.no_redirect_uri
        }
        let user_id = ctx.session.user_id
        if (!user_id) {
            ctx.redirect(`/view/login?${ctx.originalUrl.split('?')[1]}`)
            return
        }

        let { code, redirect_url } = await this.service.oauth.authorizationCode(user_id)
        switch (true) {
            case redirect_url.includes(this.config.no_redirect_uri) && ctx.query.from === 'ios':
            case redirect_url.includes(this.config.no_redirect_uri) && ctx.query.from === 'android':
                await ctx.render('callback-app.nj', {
                    appType: ctx.query.from,
                    oauthData: {
                        authorization_code: code.authorizationCode,
                        expires_at: code.expiresAt
                    }
                })
                break
            case redirect_url.includes(this.config.no_redirect_uri) && ctx.query.from === 'mini':
                ctx.body = {
                    authorization_code: code.authorizationCode,
                    expires_at: code.expiresAt
                }
                break
            default:
                /**
                 * 使用unsafeRedirect，因为没办法将所有Oauth客户端的域名加入白名单
                 */
                ctx.unsafeRedirect(redirect_url)
        }

    }

    /**
     * 授权码认证 / 刷新Token
     * @returns {Promise<void>}
     */
    async authorization() {
        const ctx = this.ctx
        if (!ctx.request.body.redirect_uri) {
            // APP 无需redirect_uri，仅用于用于绕过Oauth验证，该URL无意义
            ctx.request.body.redirect_uri = this.config.no_redirect_uri
        }
        ctx.body = await this.ctx.service.oauth.authorization()
    }

}

module.exports = OauthController
