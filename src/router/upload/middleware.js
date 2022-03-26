const fs = require('fs')
const path = require('path')

const jimp = require('jimp')  // 图片压缩

const multer = require('koa-multer')

const {
  getInfo,
  updateAvatar,
  createAvatar,
  updateAvatarUrl,
  // remove,
  uploadPictures
} = require('./service')
const { AVATAR_PATH, PICTURE_PATH } = require('../../util/file-path')
// const { PARAMS_ERROR } = require('../../util/error-type')
const { APP_URL, APP_PORT } = require('../../app/config')

const saveAvatarMulter = multer({ 
  dest: AVATAR_PATH,
  limits: {
    fileSize: 10240 * 1000,
    files: 1
  },
  fileFilter: function (req, file, cb) {
    if(!file.mimetype.indexOf('image')) {
      cb(null, true)
    }else {
      cb(new Error("请上传图片"), false)
    }
  }
})


const savePicturesMulter = multer({ 
  dest: PICTURE_PATH,
  limits: {
    fileSize: 20480 * 1000,
    files: 1
  },
  fileFilter: function (req, file, cb) {
    if(!file.mimetype.indexOf('image')) {
      cb(null, true)
    }else {
      cb(new Error("请上传图片"), false)
    }
  }
})


class UploadMiddleware {
  // 保存单个文件到服务器
  saveImg(name) {
    return async (ctx, next) =>{
      if(name === 'avatar') {
        // 保存头像
        await saveAvatarMulter.single(name)(ctx, next).catch(err =>{
          ctx.body = err.message
        })
      }else {
        const { momentId } = ctx.params
        const list = await getInfo('picture', 'moment_id', momentId)
        
        if(list.length >= 9) {
          return ctx.body = "配图不能超过9个！"
        }

        // 保存配图
        await savePicturesMulter.single(name)(ctx, next).catch(err =>{
          ctx.body = err.message
        })
      }
    }
  }

  // 保存配图到服务器(单个文件)
  // async saveAvatar(ctx, next) {
  //   await saveAvatarMulter.single('avatar')(ctx, next).catch(err =>{
  //     ctx.body = err.message
  //   })
  // }

  // // 保存配图到服务器(多个文件)
  // async savePictures(ctx, next) {
  //   await savePicturesMulter.array('picture')(ctx, next).catch(err =>{
  //     ctx.body = err.message
  //   })
  // }

  // 压缩单个图片
  async resizeFile(ctx, next) {
    const file = ctx.req.file
    const { momentId } = ctx.params
    jimp.read(file.path).then(res =>{
      if(momentId) {
        res.resize(300, jimp.AUTO).write(`${file.path}-y`)
      }else {
        res.resize(300, 300).write(`${file.path}`)
      }
    })
    await next()
  }

  // 压缩多个图片
  // async resizeFiles(ctx, next) {
  //   for(let file of ctx.req.files) {
  //     jimp.read(file.path).then(res =>{
  //       res.resize(300, jimp.AUTO).write(`${file.path}-y`)
  //     })
  //   }
  //   await next()
  // }

  // 处理头像信息
  async handleAvatar(ctx, next) {
    const { id } = ctx.user

    // if(!ctx.req.file) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)
    const { filename, mimetype, size } = ctx.req.file

    try {
      // 获取原头像信息
      const result = await getInfo("avatar", "user_id", id)

      if(result.length) {
        // 更新头像
        await updateAvatar(id, filename, mimetype, size)
  
        // 服务器删除原头像
        fs.unlink(path.join(AVATAR_PATH, `/${result[0].filename}`), error => {
          if(error) console.log("用户头像删除失败", error);
        })
      }else {
        // 新建头像
        await createAvatar(id, filename, mimetype, size)
      }

      // 更新用户信息的头像地址
      await updateAvatarUrl(`${APP_URL}:${APP_PORT}/user/${id}/avatar`, id)
      ctx.body = { data: "上传头像成功", url: `${APP_URL}:${APP_PORT}/user/${id}/avatar` }
    } catch (error) {
      ctx.body = error
    }
  }

  // 处理配图信息
  async handlePictures(ctx, next) {
    const { id } = ctx.user

    // const files = ctx.req.files
    const { momentId } = ctx.params

    try {
      // 获取原配图信息
      // const result = await getInfo("picture", "moment_id", momentId)

      // if(result.length) {
      //   // 数据库清除所有原动态配图信息
      //   await remove(momentId)

      //   // 服务器删除原配图
      //   for(let file of result) {
      //     fs.unlink(path.join(PICTURE_PATH, `/${file.filename}`), error => {
      //       if(error) console.log("配图删除失败", error);
      //     })
      //     fs.unlink(path.join(PICTURE_PATH, `/${file.filename}-y`), error => {
      //       if(error) console.log("-y配图删除失败", error);
      //     })
      //   }
      // }
      
      // 上传新配图信息
      // for(let file of files) {
      //   const { filename, mimetype, size } = file
      //   await uploadPictures(id, filename, mimetype, size, momentId)
      // }

      const { filename, mimetype, size } = ctx.req.file
      // console.log(ctx.req.file);
      await uploadPictures(id, filename, mimetype, size, momentId)

      ctx.body = "上传配图成功~"
    } catch (error) {
      ctx.body = error
    }
  }

}

module.exports = new UploadMiddleware()