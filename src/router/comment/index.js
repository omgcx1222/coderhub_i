const Router = require('koa-router')

const { verifyToken, verifyPermission, verifyMoment, verifyMomentAndComment } = require('../../common/common-middleware')
const { pubComment, replyComment, deleteComment, commentList, goAgree } = require('./middleware')

const commentRouter = new Router({prefix: '/comment'})

commentRouter.post('/', verifyToken, verifyMoment, pubComment) // 对动态发表评论
commentRouter.post('/:commentId', verifyToken, verifyMomentAndComment, replyComment) // 对评论进行回复
commentRouter.delete('/:commentId', verifyToken, verifyPermission("comment"), deleteComment) // 删除评论
commentRouter.get('/', commentList) // 获取动态的评论列表
commentRouter.post('/:commentId/like', verifyToken, goAgree) // 点赞

module.exports = commentRouter