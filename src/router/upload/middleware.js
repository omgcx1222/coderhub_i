const fs = require('fs')
const path = require('path')

const multer = require('koa-multer')

const {
  getInfo,
  updateAvatar,
  createAvatar,
  updateAvatarUrl,
  remove,
  uploadPictures
} = require('./service')
const { AVATAR_PATH, PICTURE_PATH } = require('../../util/file-path')
const { PARAMS_ERROR } = require('../../util/error-type')
const { APP_URL, APP_PORT } = require('../../app/config')

const saveAvatarMulter = multer({ dest: AVATAR_PATH })
const savePicturesMulter = multer({ dest: PICTURE_PATH })

class UploadMiddleware {
  // 保存头像到服务器
  saveAvatar =  saveAvatarMulter.single('avatar')

  // 保存配图到服务器
  savePictures = savePicturesMulter.array('picture')

  // 处理头像信息
  async handleAvatar(ctx, next) {
    const { id } = ctx.user

    if(!ctx.req.file) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)
    const { filename, mimetype, size } = ctx.req.file
    
    try {
      // 获取原头像信息
      const result = await getInfo("avatar", "user_id", id)

      if(result.length) {
        // 更新头像
        await updateAvatar(id, filename, mimetype, size)
  
        // 服务器删除原头像
        fs.unlink(path.join(AVATAR_PATH, `/${result[0].filename}`), error => {
          if(error) {
            console.log("用户头像删除失败", error);
          }
        })
      }else {
        // 新建头像
        await createAvatar(id, filename, mimetype, size)
      }

      // 更新用户信息的头像地址
      await updateAvatarUrl(`${APP_URL}:${APP_PORT}/user/${id}/avatar`, id)
      ctx.body = "上传头像成功~"
    } catch (error) {
      ctx.body = error
    }
  }

  // 处理配图信息
  async handlePictures(ctx, next) {
    const { id } = ctx.user

    if(!ctx.req.files || !ctx.params) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)
    const files = ctx.req.files
    const { momentId } = ctx.params

    try {
      // 获取原配图信息
      const result = await getInfo("picture", "moment_id", momentId)

      if(result.length) {
        // 清除所有原动态配图
        await remove(momentId)

        // 服务器删除原配图
        for(let file of result) {
          fs.unlink(path.join(PICTURE_PATH, `/${file.filename}`), error => {
            if(error) {
              console.log("配图删除失败", error);
            }
          })
        }
      }
      
      // 上传新配图信息
      for(let file of files) {
        const { filename, mimetype, size } = file
        await uploadPictures(id, filename, mimetype, size, momentId)
      }

      ctx.body = "上传配图成功~"
    } catch (error) {
      ctx.body = error
    }
  }
}

module.exports = new UploadMiddleware()