const connection = require('../../app/database')

class UserService {
  // 注册
  async create(user) {
    const { username, password, nickname } = user
    const statement = 'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)'
    try {
      const [result] = await connection.execute(statement, [username, password, nickname])
      return result
    } catch (error) {
      ctx.body = error
    }
  }

  // 获取用户头像信息
  async avatar(id) {
    const statement = "SELECT * FROM avatar WHERE user_id = ?"
    const [result] = await connection.execute(statement, [id])
    return result
  }
}

module.exports = new UserService()