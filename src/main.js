const app = require('./app')
const config = require('./app/config')

require('./app/database')  // 加载数据库连接池

app.listen(config.APP_PORT, () =>{
  console.log(`服务器启动成功，端口为${config.APP_PORT}`);
})