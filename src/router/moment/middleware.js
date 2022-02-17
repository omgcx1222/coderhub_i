const fs = require('fs')
const path = require('path')

const { insertMoment, detail, list, update, remove, picture } = require('./service')
const { CONTENT, PARAMS_ERROR } = require('../../util/error-type')
const { PICTURE_PATH } = require('../../util/file-path')
const { agreeExist, agree, deleteAgree } = require('../../common/common-service')

class MomentMiddleware {
  // 发表动态
  async createMoment(ctx, next) {
    const id = ctx.user.id
    const { content, label } = ctx.request.body
    if(!content || !label) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)

    // 校验content长度
    if(content.length > 1000) {
      const err = new Error(CONTENT)
      return ctx.app.emit('error', err, ctx)
    }

    try {
      await insertMoment(id, content, label)
      ctx.body = "发表动态成功~"
    } catch (error) {
      ctx.body = "发表动态失败，标签id不存在：" + error.message
    }
  }

  // 获取动态详情
  async momentDetail(ctx, next) {
    const { momentId } = ctx.params
    const result = await detail(momentId)
    ctx.body = result
  }

  // 获取动态列表
  async momentList(ctx, next) {
    let { label, order='0', offset='0', limit='10' } = ctx.query

    // （0为最热，1为最新）
    switch(order) {
      case '1': 
        order = 'agree';
        break;
      default:
        order = 'm.updateTime'
    }

    const result = await list(label, order, offset, limit)
    ctx.body = result
  }

  // 修改动态
  async updateMoment(ctx, next) {
    const { content, label } = ctx.request.body
    const momentId = ctx.params.momentId
    if(!content || !label) return ctx.app.emit('error', new Error(PARAMS_ERROR), ctx)

    try {
      // 修改内容
      await update(momentId, label, content)

      ctx.body = "修改动态成功~"
    } catch (error) {
      ctx.body = "修改动态失败，标签id不存在：" + error.message
    }
  }

  // 删除动态
  async removeMoment(ctx, next) {
    const momentId = ctx.params.momentId
    const result = await remove(momentId)
    ctx.body = result
  }

  // 读取动态配图
  async getPicture(ctx, next) {
    const { filename } = ctx.params
    try {
      // 图片末尾有 -y 则表示为压缩后的图片，数据库中只保存了压缩前的图片信息
      const zfilename = filename.replace('-y', '')
      const result = await picture(zfilename)
      ctx.response.set('content-type', result[0].mimetype)
      ctx.body = fs.createReadStream(path.join(PICTURE_PATH, filename))
    } catch (error) {
      ctx.body = error
    }
  }

  // 动态点赞或点踩
  async goAgree(ctx, next) {
    const { id } = ctx.user
    const { momentId } = ctx.params
    try {
      const result = await agreeExist(id, momentId, "moment")
      if(!result.length) {
        await agree(id, momentId, "moment")
        ctx.body = "点赞成功"
      }else {
        await deleteAgree(id, momentId, "moment")
        ctx.body = "取消点赞"
      }
    } catch (error) {
      ctx.body = "点赞失败"
    }
  }
}

module.exports = new MomentMiddleware()