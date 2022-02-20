const Koa = require('koa')
const bodyParser = require('koa-bodyparser') // 解析json

const fs = require('fs')
const path = require('path')

// const userRouter = require('../router/user')
// const loginRouter = require('../router/login')

const errorHandle = require('../util/error-handle')

const app = new Koa()

app.use(bodyParser())

// 解决跨域问题
app.use(async (ctx, next) =>{
  // 修改响应头
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.response.set('Access-Control-Allow-Methods', 'PATCH, POST, GET, DELETE, OPTIONS');

  if(ctx.request.method == 'OPTIONS') {
    ctx.body = 200
  }else {
    await next()
  }
})

fs.readdirSync(path.join(__dirname, '../router')).forEach(file =>{
  const router = require(`../router/${file}`)
  app.use(router.routes())
  // app.use(router.allowedMethods())
})

// app.use(userRouter.routes())
// // app.use(userRouter.allowedMethods())

// app.use(loginRouter.routes())

app.on('error', errorHandle)

module.exports = app