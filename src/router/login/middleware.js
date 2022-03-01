const jwt = require('jsonwebtoken')

const common = require('../../common/common-service')
const errorType = require('../../util/error-type')
const md5password = require('../../util/md5password')
const { PRIVATE_KEY } = require('../../app/config')

class LoginMiddleware {
  // 验证登录账号密码
  async verifyLogin(ctx, next) {
    // 获取登录信息
    const { username, password } = ctx.request.body
    if(!username || !password) return ctx.app.emit('error', new Error(errorType.PARAMS_ERROR), ctx)
    
    // 判断账号密码是否为空
    if(!username || !password) {
      const err = new Error(errorType.USERNAME_PASSWORD_IS_NULL)
      return ctx.app.emit('error', err, ctx)
    }

    // 判断账号是否存在
    const result = await common.userExist("username", username)
    if(!result.length) {
      const err = new Error(errorType.USERNAME_IS_NULL)
      return ctx.app.emit('error', err, ctx)
    }

    // 判断密码是否正确
    if(result[0].password !== md5password(password)) {
      const err = new Error(errorType.USERNAME_PASSWORD_ERROR)
      return ctx.app.emit('error', err, ctx)
    }

    ctx.user = result[0]
    await next()
  }

  // 登录通过
  async login(ctx, next) {
    // 获取用户信息
    const { id, username, nickname, avatar_url } = ctx.user
    
    // 颁发token
    const token = jwt.sign({ id, username }, PRIVATE_KEY, {
      expiresIn: 60 * 60 * 24,
      // expiresIn: 10,
      algorithm: "RS256"
    })

    // 返回登录结果
    ctx.body = { id, username, nickname, avatarUrl: avatar_url, token }
  }
}

module.exports = new LoginMiddleware()