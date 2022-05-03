const Router = require('koa-router')

// const { verifyToken } = require('../../common/common-middleware')
const { connectSocket } = require('./middleware')


const socketRouter = new Router({prefix: '/socket'})
socketRouter.get('/', connectSocket)

module.exports = socketRouter