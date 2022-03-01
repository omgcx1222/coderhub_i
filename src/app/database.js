const mysql = require('mysql2')
const config = require('./config')

// 创建数据库连接池
const connection  = mysql.createPool({
  host: config.MYSQL_HOST,
  port: config.MYSQL_PORT,
  database: config.MYSQL_DATABASE,
  user: config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,
  connectionLimit: config.MYSQL_CONNECTIONLIMIT,
  // 2022-03-01T17:31:04.000Z
  timezone: '+00:00'
})

connection.getConnection((err, conn) =>{
  if(err) {
    console.log("连接数据库失败：", err);
  }else {
    console.log("连接数据库成功");
  }
})

module.exports = connection.promise()