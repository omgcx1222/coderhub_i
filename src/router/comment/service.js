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

  // 根据动态获取该动态的评论列表
  async listInMoment(userId, momentId, order, offset, limit) {
    const statement = `
      SELECT c.id, c.content, c.createTime, c.moment_id momentId, c.comment_id commentId,
        JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) user,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id) agree,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id AND cg.user_id = ?) isAgree,
        (SELECT COUNT(*) FROM comment c2 WHERE c2.comment_id = c.id) child_count
      FROM comment c LEFT JOIN users u ON c.user_id = u.id
      WHERE c.moment_id = ? AND c.comment_id IS NULL
      ORDER BY ${order} DESC
      LIMIT ?, ?
    `
    try {
      const [result] = await connection.execute(statement, [userId, momentId, offset, limit])
      return result
    } catch (error) {
      return error.message
    }
  }

  // 获取动态某个评论的回复列表
  async listInComment(userId, commentId) {
    const statement = `
      SELECT c.id, c.content, c.createTime, c.moment_id momentId, c.comment_id commentId,
        JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) user,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id) agree,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id AND cg.user_id = ?) isAgree
      FROM comment c LEFT JOIN users u ON c.user_id = u.id
      WHERE c.comment_id = ?
      ORDER BY c.createTime ASC
    `
    try {
      const [result] = await connection.execute(statement, [userId, commentId])
      return result
    } catch (error) {
      return error.message
    }
  }

  // 根据用户id获取评论列表
  async listInUser(userId, offset, limit) {
    // SELECT c.id, c.content, c.createTime, c.moment_id momentId, c.comment_id commentId
    //   FROM comment c
    //   WHERE c.user_id = ?
    //   ORDER BY c.createTime DESC
    //   LIMIT ?, ?
    const statement = `
      SELECT c.id, c.content, c.createTime, c.moment_id momentId, c.comment_id commentId,
        JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'avatarUrl', u.avatar_url) user,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id) agree,
        (SELECT COUNT(*) FROM comment_agree cg WHERE cg.comment_id = c.id AND cg.user_id = ?) isAgree,
        (SELECT COUNT(*) FROM comment c2 WHERE c2.comment_id = c.id) child_count
      FROM comment c LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.createTime DESC
      LIMIT ?, ?
    `
    try {
      const [res] = await connection.execute(statement, [userId, userId, offset, limit])
      return res
    } catch (error) {
      return error.message
    }
  }
}

module.exports = new CommentService()