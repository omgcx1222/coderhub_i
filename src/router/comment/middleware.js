const { pub, reply, remove, listInMoment, listInUser } = require('./service')
const { PARAMS_ERROR } = require('../../util/error-type')
const { agreeExist, agree, deleteAgree } = require('../../common/common-service')

class CommentMiddleware {
  // 发表评论
  async pubComment(ctx, next) {
    const { id } = ctx.user
    const { content, momentId } = ctx.request.body
    if(!content || !momentId) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)
    
    const result = await pub(id, content, momentId)
    ctx.body = result
  }

  // 回复评论
  async replyComment(ctx, next) {
    const { id } = ctx.user
    const { content, momentId } = ctx.request.body
    const { commentId } = ctx.params
    try {
      await reply(id, content, momentId, commentId)
      ctx.body = "回复成功"
    } catch (error) {
      ctx.body = error
    }
  }

  // 删除回复
  async deleteComment(ctx, next) {
    const { commentId } = ctx.params
    const result = await remove(commentId)

    ctx.body = result
  }

  // 获取动态的评论列表
  async commentList(ctx, next) {
    const { momentId } = ctx.query
    if(momentId) {  // 根据动态获取
      let { order='0', offset='0', limit='10' } = ctx.query
      switch(order) {
        case '1': 
          order = 'c.createTime'
          break;
        default:
          order = 'agree'
      }
      const result = await listInMoment(momentId, order, offset, limit)
      ctx.body = result
    }else {  // 根据用户id获取
      const { userId, offset='0', limit='10' } = ctx.query
      if(!userId) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)

      const result = await listInUser(userId, offset, limit)
      ctx.body = result
    }
  }

  // 点赞
  async goAgree(ctx, next) {
    const { id } = ctx.user
    const { commentId } = ctx.params
    try {
      const result = await agreeExist(id, commentId, "comment")
      if(!result.length) {
        await agree(id, commentId, "comment")
        ctx.body = "点赞成功"
      }else {
        await deleteAgree(id, commentId, "comment")
        ctx.body = "取消点赞"
      }
    } catch (error) {
      ctx.body = "点赞失败"
    }
  }
}

module.exports = new CommentMiddleware()