const fs = require('fs')

const errorType = require('../../util/error-type')
const service = require('./service')
const common = require('../../common/common-service')
const md5password = require('../../util/md5password')
const { AVATAR_PATH } = require('../../util/file-path')

class UserMiddleware {
  // 用户验证
  async verifyUser(ctx, next) {
    const { username, password, nickname } = ctx.request.body

    // 判断账号密码是否为空
    if(!username || !password || !nickname) {
      const err = new Error(errorType.USERNAME_PASSWORD_IS_NULL)
      return ctx.app.emit('error', err, ctx)
    }

    // 校验账号密码规则（4-16，数字或字母组成 -- 数字,英文,字符中的两种以上，长度4-16）
    const usernameRule = /^[a-zA-Z0-9]{4,16}$/;
    const passwordRule = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$).{4,16}$/;
    if(!usernameRule.test(username) || !passwordRule.test(password)) {
      const err = new Error(errorType.USERNAME_PASSWORD_RULE)
      return ctx.app.emit('error', err, ctx)
    }

    // 判断账号是否存在
    const result1 = await common.userExist("username", username)
    if(result1.length) {
      const err = new Error(errorType.USERNAME_EXIST)
      return ctx.app.emit('error', err, ctx)
    }

    // 判断昵称是否存在
    const result2 = await common.userExist("nickname", nickname)
    if(result2.length) {
      const err = new Error(errorType.NICKNAME_EXIST)
      return ctx.app.emit('error', err, ctx)
    }

    await next()
  }

  // 密码加密
  async passwordHandle(ctx, next) {
    ctx.request.body.password = md5password(ctx.request.body.password)
    await next()
  }

  // 注册
  async createUser(ctx, next) {
    // 获取请求参数
    const user = ctx.request.body

    // 数据库操作
    await service.create(user)

    // 返回结果
    ctx.body = "注册成功"
  }

  // 读取头像
  async getAvatar(ctx, next) {
    const { userId } = ctx.params
    const result = await service.avatar(userId)

    ctx.response.set('Content-Type', result.mimetype)
    ctx.body = fs.createReadStream(`${AVATAR_PATH}/${result[0].filename}`)
  }
}

module.exports = new UserMiddleware()