const Router = require('koa-router')

const { verifyToken, verifyPermission } = require('../../common/common-middleware')
const { saveAvatar, handleAvatar, savePictures, handlePictures, resizeFile, resizeFiles } = require('./middleware')

const uploadRouter = new Router({prefix: '/upload'})

uploadRouter.post('/avatar', verifyToken, saveAvatar, resizeFile, handleAvatar)  // 上传头像
uploadRouter.post('/:momentId/pictures', verifyToken, verifyPermission("moment"), savePictures, resizeFiles, handlePictures)  // 上传动态配图

module.exports = uploadRouter