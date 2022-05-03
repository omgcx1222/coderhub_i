const Koa = require('koa')
const bodyParser = require('koa-bodyparser') // 解析json
const websocket = require('koa-websocket')

const fs = require('fs')
const path = require('path')

const errorHandle = require('../util/error-handle')

// const app = new Koa()
const app = websocket(new Koa())

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

// 导入路由
fs.readdirSync(path.join(__dirname, '../router')).forEach(file =>{
  if(file === 'socket') return;
  const router = require(`../router/${file}`)
  app.use(router.routes())
  // app.use(router.allowedMethods())
})

// 导入socket路由
const socketRouter = require('../router/socket')
app.ws.use(socketRouter.routes())

// 处理响应错误信息
app.on('error', errorHandle)

module.exports = app