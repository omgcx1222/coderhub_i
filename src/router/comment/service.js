const connection = require('../../app/database')

class CommentService {
  // 发表评论
  async pub(uId, content, mId) {
    const statement = "INSERT INTO `comment` (user_id, content, moment_id) VALUES (?, ?, ?)"
    try {
      await connection.execute(statement, [uId, content, mId])
      return "发表评论成功"
    } catch (error) {
      return "发表评论失败"
    }
  }

  // 回复评论
  async reply(uId, content, mId, cId) {
    const statement = "INSERT INTO comment (user_id, content, moment_id, comment_id) VALUES (?, ?, ?, ?)"
    const result = await connection.execute(statement, [uId, content, mId, cId])

    return result[0]
  }

  // 删除回复
  async remove(id) {
    const statement = "DELETE FROM comment WHERE id = ?"
    try {
      await connection.execute(statement, [id])
      return "删除成功"
    } catch (error) {
      return "删除失败" + error.message
    }
  }

  // 获取动态的评论列表
  async list(momentId, order, offset, limit) {
    const statement = `
      SELECT c.id, c.content, c.createTime, c.moment_id momentId, c.comment_id commentId,
        JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) user,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id and cg.is_agree = 1) agree,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id and cg.is_agree = 0) notAgree
      FROM comment c LEFT JOIN users u ON c.user_id = u.id
      WHERE moment_id = ?
      ORDER BY ${order} DESC
      LIMIT ?, ?
    `
    try {
      const [result] = await connection.execute(statement, [momentId, offset, limit])
      return result
    } catch (error) {
      return error.message
    }
  }
}

module.exports = new CommentService()