const Koa = require('koa')
const bodyParser = require('koa-bodyparser') // 解析json

const fs = require('fs')
const path = require('path')

// const userRouter = require('../router/user')
// const loginRouter = require('../router/login')

const errorHandle = require('../util/error-handle')

const app = new Koa()

app.use(bodyParser())


fs.readdirSync(path.join(__dirname, '../router')).forEach(file =>{
  const router = require(`../router/${file}`)
  app.use(router.routes())
})

// app.use(userRouter.routes())
// // app.use(userRouter.allowedMethods())

// app.use(loginRouter.routes())

app.on('error', errorHandle)

module.exports = app