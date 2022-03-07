const connection = require('../../app/database')

class UploadService {
  // 查询
  async getInfo(type, typeId, id) {
    const statement = `SELECT * FROM ${type} WHERE ${typeId} = ?`
    try {
      const [result] = await connection.execute(statement, [id])
      return result
    } catch (error) {
      return ctx.body = error.message
    }
  }
  
  // 更新用户头像信息
  async updateAvatar(userId, fileName, mimetype, size) {
    const statement = "UPDATE avatar SET filename = ?, mimetype = ?, size = ? WHERE user_id = ?"
    const [result] = await connection.execute(statement, [fileName, mimetype, size, userId])
    return result
  }

  // 新建头像
  async createAvatar(userId, fileName, mimetype, size) {
    const statement = "INSERT INTO avatar (user_id, filename, mimetype, size) VALUES (?, ?, ?, ?)"
    const [result] = await connection.execute(statement, [userId, fileName, mimetype, size])
    return result
  }

  // 更新用户信息的头像地址
  async updateAvatarUrl(url, userId) {
    const statement = "UPDATE users SET avatar_url = ? WHERE id = ?"
    const [result] = await connection.execute(statement, [url, userId])
    return result
  }

  // 清除
  // async remove(id) {
  //   const statement = `DELETE FROM picture WHERE moment_id = ?`
  //   const [result] = await connection.execute(statement, [id])
  //   return result
  // }

  // 上传配图信息
  async uploadPictures(userId, filename, mimetype, size, momentId) {
    try {
      const statement = "INSERT INTO picture (user_id, filename, mimetype, size, moment_id) VALUES (?, ?, ?, ?, ?)"
      await connection.execute(statement, [userId, filename, mimetype, size, momentId])
      return "上传成功~"
    } catch (error) {
      return error.message
    }
  }
}

module.exports = new UploadService()