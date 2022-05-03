const connection = require('../../app/database')

class SocketService {
  // 创建记录
  async createChatRecord(id, content) {
    const statement = "INSERT INTO chat_record (user_id, content) VALUES (?, ?)"
    try {
      const [result] = await connection.execute(statement, [id, content])
      return result
    } catch (error) {
      return error.message
    }
  }

  // 查询记录
  async selectChatRecord(id) {
    try {
      let statement = ''
      if(id) {
        statement = `
          SELECT cr.content, cr.createTime,
            JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) user
          FROM chat_record cr 
          LEFT JOIN users u ON cr.user_id = u.id
          WHERE cr.id = ?
        `
        const [result] = await connection.execute(statement, [id])
        return result
      }else {
        statement = `
          SELECT cr.content, cr.createTime,
            JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) user
          FROM chat_record cr 
          LEFT JOIN users u ON cr.user_id = u.id
          ORDER BY cr.createTime
        `
        const [result] = await connection.execute(statement)
        return result
      }
    } catch (error) {
      return error.message
    }
  }
}

module.exports = new SocketService()