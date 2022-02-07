const { pub, reply, remove, list } = require('./service')

class CommentMiddleware {
  // 发表评论
  async pubComment(ctx, next) {
    const { id } = ctx.user
    const { content, momentId } = ctx.request.body
    const result = await pub(id, content, momentId)

    ctx.body = result
  }

  // 回复评论
  async replyComment(ctx, next) {
    const { id } = ctx.user
    const { content, momentId } = ctx.request.body
    const { commentId } = ctx.params

    const result = await reply(id, content, momentId, commentId)

    ctx.body = result
  }

  // 删除回复
  async deleteComment(ctx, next) {
    const { commentId } = ctx.params
    const result = await remove(commentId)

    ctx.body = result
  }

  // 获取动态的评论列表
  async commentList(ctx, next) {
    let { momentId, order, offset=0, limit=10 } = ctx.query
    switch(order * 1) {
      case 1: 
        order = 'c.createTime'
        break;
      default:
        order = 'agree'
    }
    const result = await list(momentId, order, offset, limit)

    ctx.body = result
  }
}

module.exports = new CommentMiddleware()