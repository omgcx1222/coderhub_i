const context = require('koa/lib/context')
const connection = require('../app/database')

class CommonService {
  // 判断账号或昵称是否存在
  async userExist(type, un) {
    const statement = `SELECT * FROM users WHERE ${type} = ?`
    try {
      const [result] = await connection.execute(statement, [un])
      return result
    } catch (error) {
      return ctx.body = error
    }
  }

  // 验证修改权限
  async permissionExist(tableName, typeId, id) {
    const statement = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?`
    try {
      const [result] = await connection.execute(statement, [typeId, id])
      return result
    } catch (error) {
      return []
    }
  }

  // 检查动态是否存在
  async momentExist(id) {
    const statement = `SELECT * FROM moment WHERE id = ?`
    try {
      const [result] = await connection.execute(statement, [id])
      return result
    } catch (error) {
      return []
    }
  }

  // 检查动态和评论是否同时存在
  async macExist(cId, mId) {
    const statement = `SELECT * FROM comment WHERE id = ? AND moment_id = ?`
    try {
      const [result] = await connection.execute(statement, [cId, mId])
      return result
    } catch (error) {
      return []
    }
  }

  // 检查点赞是否存在
  async agreeExist(userId, id, type) {
    const statement = `SELECT * FROM ${type}_agree WHERE user_id = ? AND ${type}_id = ?`
    const [result] = await connection.execute(statement, [userId, id])
    return result
  }

  // 点赞
  async agree(userId, id, type) {
    const statement = `INSERT INTO ${type}_agree (user_id, ${type}_id) VALUES (?, ?)`
    const [result] = await connection.execute(statement, [userId, id])
    return result
  }

  // 删除点赞
  async deleteAgree(userId, id, type) {
    const statement = `DELETE FROM ${type}_agree WHERE user_id = ? AND ${type}_id = ?`
    const [result] = await connection.execute(statement, [userId, id])
    
    return result
  }
}

module.exports = new CommonService()