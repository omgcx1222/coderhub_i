const connection = require('../../app/database')
const { APP_URL, APP_PORT } = require('../../app/config')

class MomentService {
  // 发表动态
  async insertMoment(id, content) {
    const statement = "INSERT INTO moment (user_id, content) VALUES (?, ?);"
    const result = await connection.execute(statement, [id, content])
    
    return result[0]
  }

  // 添加标签
  async addLAbel(id, labels) {
    try {
      for(let labelId of labels) {
        const statement2 = "INSERT INTO moment_label (moment_id, label_id) VALUES (?, ?)"
        await connection.execute(statement2, [id, labelId])
      }
  
      return "添加标签成功"
    } catch (error) {
      return error
    }
  }

  // 获取动态详情
  async detail(id) {
    const statement = `
      SELECT m.id momentId, m.content content, m.createTime createTime, m.updateTime updateTime,
        IF(COUNT(u.id),JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url), null) author,
        (SELECT COUNT(*) FROM moment_agree mg WHERE mg.moment_id = m.id and mg.is_agree = 1) agree,
        (SELECT COUNT(*) FROM moment_agree mg WHERE mg.moment_id = m.id and mg.is_agree = 0) notAgree,
        IF(COUNT(ml.label_id),JSON_ARRAYAGG(JSON_OBJECT('id', ml.label_id, 'name', (SELECT name FROM label WHERE id = ml.label_id))), NULL) labels,
        (SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/moment/picture/', p.filename)) FROM picture p WHERE p.moment_id = m.id) pictures
      FROM moment m LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN moment_label ml ON ml.moment_id = m.id
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

  // 获取动态列表
  async list(order, offset, limit) {
    const statement = `
      SELECT m.id momentId, m.content content, m.createTime createTime, m.updateTime updateTime,
        JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) author,
        (SELECT COUNT(*) FROM comment c WHERE m.id = c.moment_id) commentCount,
        (SELECT COUNT(*) FROM moment_agree mg WHERE mg.moment_id = m.id and mg.is_agree = 1) agree,
        (SELECT COUNT(*) FROM moment_agree mg WHERE mg.moment_id = m.id and mg.is_agree = 0) notAgree
      FROM moment m LEFT JOIN users u
      ON m.user_id = u.id
      ORDER BY ${order} DESC
      LIMIT ?, ?
    `
    
    try {
      const result = await connection.execute(statement, [offset, limit])
      return result[0]
    } catch (error) {
      return error
    }
  }

  // 修改动态内容
  async update(id, content) {
    // 修改内容
    const statement = "UPDATE moment SET content = ? WHERE id = ?"
    await connection.execute(statement, [content, id])

    return "修改内容成功~"
  }

  // 删除动态对应的所有标签
  async delLabel(id) {
    const statement2 = "DELETE FROM moment_label WHERE moment_id = ?"
    await connection.execute(statement2, [id])
  }

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