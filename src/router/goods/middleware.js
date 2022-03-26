const fs = require('fs')
const path = require('path')

const jwt = require('jsonwebtoken')

const { PUBLIC_KEY } = require('../../app/config')
const { GOODSIMG_PATH } = require('../../util/file-path')
const { imgList, goodsList, img, countExist, createCount, updateCount, removeCount } = require('./service.js')

class Goods {
  // 读取商品列表
  async goodsList(ctx, next) {
    // 获取请求头中的token
    const authorization = ctx.request.headers.authorization || ""
    const token = authorization.replace("Bearer ", "")
    // 验证token
    try {
      const result = jwt.verify(token, PUBLIC_KEY, {
        algorithms: ["RS256"]
      })
      // 验证token通过，保存验证token的用户的信息
      // ctx.user = result
      const list = await goodsList(result.id)
      ctx.body = list
    } catch (err) {
      const info = await goodsList()
      ctx.body = info
    }

  }

  // 轮播图
  async swiperImg(ctx, next) {
    try {
      const info = await imgList()
      ctx.body = info[0]
    } catch (error) {
      ctx.body = error.message
    }
  }

  // 读取图片
  async getImg(ctx, next) {
    const { filename } = ctx.params
    try {
      const info = await img(filename)
      ctx.response.set('content-type', info[0].mimetype)
      ctx.body = fs.createReadStream(path.join(GOODSIMG_PATH, filename))
    } catch (error) {
      ctx.body = error
    }
  }

  // 添加商品
  async addCount(ctx, next) {
    const { goodsId='', count='' } = ctx.request.body
    if(!goodsId) return ctx.body = "商品不存在"

    const { id } = ctx.user
    const result = await countExist(id, goodsId)

    if(!result.length) {
      // 加入购物车
      const s = await createCount(id, goodsId, count)
      ctx.body = "新添商品成功"
    }else {
      
      if(count == 0) {
        // 从购物车删除该商品
        const s = await removeCount(id, goodsId)
        ctx.body = "删除成功"
      }else {
        // 修改购物车商品数量
        const s = await updateCount(id, goodsId, count)
        ctx.body = "修改数量成功"
      }
    }
    
  }
}

module.exports = new Goods()