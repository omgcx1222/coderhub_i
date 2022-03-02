const errorType = require('./error-type')

const errorHandle = (err, ctx) => {
  switch(err.message) {
    case errorType.USERNAME_PASSWORD_IS_NULL: 
      ctx.status = 400
      ctx.body = "账号或密码或昵称不能为空！"
      break;

    case errorType.USERNAME_EXIST: 
      ctx.status = 409
      ctx.body = "账号已存在"
      break;

    case errorType.NICKNAME_EXIST: 
      ctx.status = 409
      ctx.body = "该昵称已存在"
      break;

    case errorType.USERNAME_PASSWORD_RULE: 
      ctx.status = 400
      ctx.body = "账号或密码不符合规则（账号：4-16 字母或数字，密码：4-16 字母数字符号至少包含2种）"
      break;

    case errorType.USERNAME_IS_NULL: 
      ctx.status = 400
      ctx.body = "账号不存在"
      break;

    case errorType.USERNAME_PASSWORD_ERROR: 
      ctx.status = 400
      ctx.body = "密码错误"
      break;

    case errorType.TOKEN_NOT_OK: 
      ctx.status = 401
      ctx.body = "未登录"
      break;

    case errorType.CONTENT: 
      ctx.status = 400
      ctx.body = "content内容为空或内容过长"
      break;

    case errorType.NOT_OPERATION_PERMISSION: 
      ctx.status = 401
      ctx.body = "没有操作权限"
      break;

    case errorType.PARAMS_ERROR: 
      ctx.status = 400
      ctx.body = "参数错误"
    break;

    case errorType.MOMENT_EXIST: 
      ctx.status = 400
      ctx.body = "该动态不存在"
    break;

    case errorType.COMMENT_EXIST: 
      ctx.status = 400
      ctx.body = "该评论不存在"
    break;
      
    default: 
      ctx.status = 404
      ctx.body = 'Not Found'
  }
}

module.exports = errorHandle