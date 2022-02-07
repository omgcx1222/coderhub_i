const Router = require('koa-router')

const { verifyToken, verifyPermission } = require('../../common/common-middleware')
const { 
  createMoment, 
  momentDetail, 
  momentList, 
  updateMoment,
  removeMoment,
  getPicture
} = require('./middleware')

const commentRouter = new Router({prefix: '/moment'})

commentRouter.post('/', verifyToken, createMoment) // 发表动态
commentRouter.get('/:momentId', momentDetail) // 动态详情
commentRouter.get('/', momentList) // 动态列表
commentRouter.patch('/:momentId', verifyToken, verifyPermission("moment"), updateMoment) // 修改动态
commentRouter.delete('/:momentId', verifyToken, verifyPermission("moment"), removeMoment) // 删除动态
commentRouter.get('/picture/:filename', getPicture)  // 读取图片

module.exports = commentRouter