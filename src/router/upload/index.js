const Router = require('koa-router')

const { verifyToken, verifyPermission } = require('../../common/common-middleware')
const { saveAvatar, handleAvatar, savePictures, handlePictures } = require('./middleware')

const uploadRouter = new Router({prefix: '/upload'})

uploadRouter.post('/avatar', verifyToken, saveAvatar, handleAvatar)  // 上传头像
uploadRouter.post('/:momentId/pictures', verifyToken, verifyPermission("moment"), savePictures, handlePictures)  // 上传动态配图

module.exports = uploadRouter