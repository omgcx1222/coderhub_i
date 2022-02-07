const fs = require('fs')
const path = require('path')

const multer = require('koa-multer')

const {
  getInfo,
  remove,
  uploadAvatar,
  updateAvatarUrl,
  uploadPictures
} = require('./service')
const { AVATAR_PATH, PICTURE_PATH } = require('../../util/file-path')
const { APP_URL } = require('../../app/config')

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
    const { filename, mimetype, size } = ctx.req.file

    // 获取原头像信息（用于服务器删除图片）
    const result = await getInfo("avatar", "user_id", id)

    // 清除原头像
    await remove("avatar", "user_id", id)

    // 上传新头像
    await uploadAvatar(id, filename, mimetype, size)

    // 更新用户头像信息
    await updateAvatarUrl(`${APP_URL}/user/${id}/avatar`, id)

    // 服务器删除原头像
    fs.unlink(path.join(AVATAR_PATH, `/${result[0].filename}`), error => {
      if(error) {
        console.log("用户头像删除失败", error);
      }
    })

    ctx.body = "上传头像成功~"
  }

  // 处理配图信息
  async handlePictures(ctx, next) {
    const { id } = ctx.user
    const files = ctx.req.files
    const { momentId } = ctx.params

    // 获取原配图信息
    const result = await getInfo("picture", "moment_id", momentId)

    // 清除原动态配图
    await remove("picture", "moment_id", momentId)

    // 上传配图
    for(let file of files) {
      const { filename, mimetype, size } = file
      await uploadPictures(id, filename, mimetype, size, momentId)
    }

    // 服务器删除原配图
    for(let file of result) {
      fs.unlink(path.join(PICTURE_PATH, `/${file.filename}`), error => {
        if(error) {
          console.log("配图删除失败", error);
        }
      })
    }
    
    ctx.body = "上传配图成功~"
  }
}

module.exports = new UploadMiddleware()