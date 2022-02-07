const connection = require('../app/database')

class CommonService {
  // 判断账号或昵称是否存在
  async userExist(type, un) {
    const statement = `SELECT * FROM users WHERE ${type} = ?`
    const result = await connection.execute(statement, [un])

    return result[0]
  }

  // 验证修改权限
  async verifyService(tableName, typeId, id) {
    const statement = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?`
    const result = await connection.execute(statement, [typeId, id])

    return result[0]
  }
}

module.exports = new CommonService()