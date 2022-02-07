const jwt = require('jsonwebtoken')

const { PUBLIC_KEY } = require('../app/config')
const { TOKEN_NOT_OK, NOT_OPERATION_PERMISSION } = require('../util/error-type')

const { verifyService } = require('./common-service')

class CommonMiddleware {
  // 验证token
  async verifyToken(ctx, next) {
    // 获取请求头中的token
    const authorization = ctx.request.headers.authorization || ""
    const token = authorization.replace("Bearer ", "")
    // 验证token
    try {
      const result = jwt.verify(token, PUBLIC_KEY, {
        algorithms: ["RS256"]
      })
      // 验证token通过，保存验证token的用户的信息
      ctx.user = result
    } catch (err) {
      const error = new Error(TOKEN_NOT_OK)
      return ctx.app.emit('error', error, ctx)
    }

    await next()
  }

  // 验证操作权限
  verifyPermission(tableName) {
    return async (ctx, next) =>{
      const typeId = ctx.params[tableName + "Id"]
      const { id } = ctx.user
      const result = await verifyService(tableName, typeId, id)
      
      if(!result.length) {
        const error = new Error(NOT_OPERATION_PERMISSION)
        return ctx.app.emit('error', error, ctx)
      }
  
      await next()
    }
  }
}

module.exports = new CommonMiddleware()