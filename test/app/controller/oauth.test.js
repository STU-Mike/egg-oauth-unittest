
const { app, assert } = require('egg-mock/bootstrap')
describe('test/app/controller/oauth.test.js', () => {
    let authorizationCode
    let accessToken
    let refreshToken
    let cookie
    it('oauth controller login', async () => {
        app.mockCsrf()
        const login = await app.httpRequest()
            .post('/oauth/login')
            .send({
                account: '17jwmai2',
                password: 'JBL1214454wen',
            })
            .expect(200)
            .expect({
                code: '0',
            })
        cookie = login.headers['set-cookie']
    })
    it('oauth controller Authorize', async () => {
        const Authorize = await app.httpRequest()
            .get('/oauth/authorize?response_type=code&client_id=syllabus-app&redirect_uri=http://no_redirect_uri.com&state=teststate&scope=get_syllabus')
            .set('cookie', cookie)
            .expect(302)
        authorizationCode = (Authorize.header.location).match(/code=(\S*)&/)[1]
    })

    it('oauth controller token', async () => {
        app.mockCsrf()
        const token = await app.httpRequest()
            .post('/oauth/token')
            .type('form')
            .send({
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: 'http://no_redirect_uri.com',
                client_id: 'syllabus-app',
                client_secret: 'stu'
            })
            .expect(200)
        assert(token.body.code === '0')
        accessToken = token.body.accessToken
        refreshToken = token.body.refreshToken
    })

    it('oauth controller refresh token', async () => {
        const refreshtoken = await app.httpRequest()
            .post('/oauth/token')
            .type('form')
            .send({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                access_token: accessToken,
                client_id: 'syllabus-app',
                client_secret: 'stu'
            })
            .expect(200)
        assert(refreshtoken.body.code === '0')
        accessToken = refreshtoken.body.accessToken
        refreshToken = refreshtoken.body.refreshToken
    })

    it('oauth controller userInfo', async () => {
        const userInfo = await app.httpRequest()
            .get('/user/info')
            .set('Authorization', 'Bearer ' + accessToken)
            .expect(200)
        assert(userInfo.body.code === '0')
    })

    it('oauth controller view', async () => {
        await app.httpRequest()
            .get('/view/login')
            .set('Authorization', 'Bearer ' + accessToken)
            .expect(200)
    })
})