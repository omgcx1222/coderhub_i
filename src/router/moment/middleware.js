const fs = require('fs')
const path = require('path')

const { insertMoment, addLAbel, delLabel, detail, list, update, remove, picture } = require('./service')
const { CONTENT } = require('../../util/error-type')
const { PICTURE_PATH } = require('../../util/file-path')

class MomentMiddleware {
  // 发表动态
  async createMoment(ctx, next) {
    const user_id = ctx.user.id
    const { content, labels } = ctx.request.body

    // 校验content长度
    if(content.length > 1000) {
      const err = new Error(CONTENT)
      return ctx.app.emit('error', err, ctx)
    }

    const result = await insertMoment(user_id, content)
    const { insertId } = result // 获取发表的动态的id
    await addLAbel(insertId, labels)
    ctx.body = "发表动态并添加标签成功~"
  }

  // 获取动态详情
  async momentDetail(ctx, next) {
    const momentId = ctx.params.momentId
    const result = await detail(momentId)

    ctx.body = result
  }

  // 获取动态列表
  async momentList(ctx, next) {
    let { order=0, offset, limit } = ctx.query
    // （默认根据修改时间进行排序）
    switch(order * 1) {
      case 1: 
        order = 'agree';
        break;
      default:
        order = 'm.updateTime'
    }

    const result = await list(order, offset, limit)
    ctx.body = result
  }

  // 修改动态
  async updateMoment(ctx, next) {
    const { content, labels } = ctx.request.body
    const momentId = ctx.params.momentId

    // 修改内容
    const result = await update(momentId, content, labels)

    // 删除所有对应的标签
    await delLabel(momentId)

    // 添加标签
    await addLAbel(momentId, labels)

    ctx.body = result
  }

  // 删除动态
  async removeMoment(ctx, next) {
    const momentId = ctx.params.momentId

    const result = await remove(momentId)

    ctx.body = result
  }

  // 读取动态配图
  async getPicture(ctx, next) {
    const { momentId, filename } = ctx.params
    const result = await picture(filename)

    ctx.response.set('content-type', result[0].mimetype)
    ctx.body = fs.createReadStream(path.join(PICTURE_PATH, filename))
  }
}

module.exports = new MomentMiddleware()