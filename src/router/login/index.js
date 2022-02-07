const Router = require('koa-router')

const loginRouter = new Router()

const {
  verifyLogin,
  login,
} = require('./middleware')

// 登录
loginRouter.post('/login', verifyLogin, login)

module.exports = loginRouter