const jwt = require('jsonwebtoken')

const { PUBLIC_KEY } = require('../../app/config')
const { createChatRecord, selectChatRecord } = require('./serviec')

// 存储所有在线用户的ctx
let list = []

// 给所有人发送
function allSend(onLineCount, data) {
  // console.log(onLineCount, data);
  for(let user of list) {
    user.ctx.websocket.send(JSON.stringify({
      onLineCount,
      data
    }))
  }
}

// 指定给某人发送
function assignSend(ctx, onLineCount, data) {
  ctx.websocket.send(JSON.stringify({
    onLineCount,
    data
  }))
}

class SocketMiddleware {
  async connectSocket(ctx, next) {
    try {
      let currentUser = {}
    
      // 接收
      ctx.websocket.on('message', async (data) =>{
        const { userInfo, message } = JSON.parse(data)
        currentUser = userInfo
        try {
          const result = jwt.verify(userInfo.token, PUBLIC_KEY, {
            algorithms: ["RS256"]
          })
          
          const exist = list.find(item => item.userInfo.id == userInfo.id)
          if(!exist) {
            list.push({ctx, userInfo})
            const result = await selectChatRecord()
            assignSend(ctx, list.length, result)
            allSend(list.length, currentUser.id + '上线')
            return;
          }
          
          if(!message) {
            assignSend(ctx, list.length, "内容不能为空")
          }else {
            const result = await createChatRecord(userInfo.id, message)
            const result2 = await selectChatRecord(result.insertId)
            allSend(list.length, result2[0])
          }
        } catch (err) {
          console.log(err.message);
          assignSend(ctx, list.length, "未登录")
        }
      })

      // 关闭
      ctx.websocket.on('close', async (state) =>{
        if(!currentUser.id) return;
        const index = list.findIndex(item => item.userInfo.id == currentUser.id)
        if(index == -1) return;
        allSend(list.length - 1, currentUser.id + '退出')
        list.splice(index, 1)
      })
    } catch (error) {
      ctx.body = error.message
    }
  }
}

module.exports = new SocketMiddleware()