const Router = require('koa-router')

const { verifyToken } = require('../../common/common-middleware')
const { refreshToken } = require('./middleware')

const tokenRouter = new Router({prefix: '/token'})
// 更新token
tokenRouter.post('/', verifyToken, refreshToken)

module.exports =  tokenRouter