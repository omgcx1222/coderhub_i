const connection = require('../../app/database')
const { APP_URL, APP_PORT } = require('../../app/config')
const context = require('koa/lib/context')

class MomentService {
  // 发表动态
  async insertMoment(id, content, label) {
    const statement = "INSERT INTO moment (user_id, content, label_id) VALUES (?, ?, ?);"
    const result = await connection.execute(statement, [id, content, label])
    
    return result[0]
  }

  // 添加标签
  // async addLAbel(id, labels) {
  //   try {
  //     for(let labelId of labels) {
  //       const statement2 = "INSERT INTO moment_label (moment_id, label_id) VALUES (?, ?)"
  //       await connection.execute(statement2, [id, labelId])
  //     }
  
  //     return "添加标签成功"
  //   } catch (error) {
  //     return error
  //   }
  // }

  // 获取动态详情
  async detail(id) {
    const statement = `
      SELECT m.id momentId, m.content content, m.createTime createTime, m.updateTime updateTime,
        IF(COUNT(u.id),JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url), null) author,
        (SELECT COUNT(*) FROM moment_agree mg WHERE mg.moment_id = m.id) agree,
        (SELECT JSON_OBJECT('id', l.id, 'name', l.name) FROM label l WHERE l.id = m.label_id) label,
        (SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/moment/picture/', p.filename, '-y')) FROM picture p WHERE p.moment_id = m.id) images
      FROM moment m LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
      GROUP BY m.id
    `
    try {
      const [result] = await connection.execute(statement, [id])
      if(result[0].momentId == null) {
        return "该动态不存在~"
      }
      return result[0]
    } catch (error) {
      return error
    }
  }

  // 获取label获取动态列表
  async listInLabel(label, order, offset, limit) {
    const statement = `
      SELECT m.id momentId, m.content content, m.createTime createTime, m.updateTime updateTime,
        JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) author,
        (SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/moment/picture/', p.filename, '-y')) FROM picture p WHERE p.moment_id = m.id) images,
        (SELECT COUNT(*) FROM comment c WHERE m.id = c.moment_id) commentCount,
        (SELECT COUNT(*) FROM moment_agree mg WHERE mg.moment_id = m.id) agree,
        (SELECT JSON_OBJECT('id', l.id, 'name', l.name) FROM label l WHERE l.id = m.label_id) label
      FROM moment m LEFT JOIN users u
      ON m.user_id = u.id
      WHERE m.label_id = ?
      ORDER BY ${order} DESC
      LIMIT ?, ?
    `
    try {
      const result = await connection.execute(statement, [label, offset, limit])
      return result[0]
    } catch (error) {
      return error
    }
  }

  // 根据用户id获取动态列表
  async listInUser(userId, offset, limit) {
    const statement = `
      SELECT m.id momentId, m.content content, m.createTime createTime, m.updateTime updateTime,
        (SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/moment/picture/', p.filename, '-y')) FROM picture p WHERE p.moment_id = m.id) images
      FROM moment m
      WHERE m.user_id = ?
      ORDER BY m.createTime DESC
      LIMIT ?, ?
    `
    try {
      const [result] = await connection.execute(statement, [userId, offset, limit])
      return result
    } catch (error) {
      context.body = error
    }
    
  }

  // 修改动态内容
  async update(id, label, content) {
    // 修改内容
    const statement = "UPDATE moment SET content = ?, label_id = ? WHERE id = ?"
    await connection.execute(statement, [content, label, id])

    return "修改成功~"
  }

  // 删除动态对应的所有标签
  // async delLabel(id) {
  //   const statement2 = "DELETE FROM moment_label WHERE moment_id = ?"
  //   await connection.execute(statement2, [id])
  // }

  // 删除动态
  async remove(id) {
    const statement = "DELETE FROM moment WHERE id = ?"
    try {
      const [result] = await connection.execute(statement, [id])
      return "删除动态成功~"
    } catch (error) {
      return "删除动态失败" + error.message
    }
  }

  // 获取动态配图信息
  async picture(filename) {
    const statement = "SELECT * FROM picture WHERE filename = ?"
    const [result] = await connection.execute(statement, [filename])
    return result
  }
}

module.exports = new MomentService()