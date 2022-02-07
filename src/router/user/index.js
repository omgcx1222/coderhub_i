const Router = require('koa-router')

const userRouter = new Router({prefix: '/user'})

const {
  verifyUser,
  passwordHandle,
  createUser,
  getAvatar
} = require('./middleware')

userRouter.post('/', verifyUser, passwordHandle, createUser) // 注册
userRouter.get('/:userId/avatar', getAvatar)  // 查看头像

module.exports = userRouter