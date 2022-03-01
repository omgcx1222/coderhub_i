const jwt = require('jsonwebtoken')

const { userExist } = require('../../common/common-service')
const { PRIVATE_KEY } = require('../../app/config')

class Token {
  // 刷新token
  async refreshToken(ctx, next) {
    const { id, username } = ctx.user

    // 刷新用户信息
    const result = await userExist("username", username)
    if(!result.length) {
      ctx.body = "登录失效，请重新登录"
      ctx.status = 400
      return;
    }
    ctx.user = result[0]

    // 更新token
    const token = jwt.sign({ id, username }, PRIVATE_KEY, {
      // expiresIn: 10,
      expiresIn: 60 * 60 * 24,
      algorithm: "RS256"
    })

    // 返回新的登录信息
    const { nickname, avatar_url } = ctx.user
    ctx.body = { id, username, nickname, avatarUrl: avatar_url, token }
  }
}

module.exports = new Token()