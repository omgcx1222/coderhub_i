const connection = require('../../app/database')
// const { APP_URL, APP_PORT } = require('../../app/config')

class GoodsService {
  // 轮播图
  async imgList() {
    const statement = `SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/goods/', i.file_name)) swiper FROM goods_img i`
    const [result] = await connection.execute(statement)
    return result
  }

  // 商品列表
  async goodsList(id) {
    // 登录
    if(id) {
      const statement = `
        SELECT g.id, g.title, g.detail, g.price,
        (SELECT ug.count FROM users_goods ug WHERE ug.user_id = ? AND ug.goods_id = g.id) count,
        (SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/goods/', i.file_name)) swiper FROM goods_img i WHERE i.goods_id = g.id) img
        FROM goods g
      `
      try {
        const [result] = await connection.execute(statement, [id])
        return result
      } catch (error) {
        return error.message
      }
    }else {
      // 未登录
      const statement = `
        SELECT id, title, detail, price, count,
        (SELECT JSON_ARRAYAGG(CONCAT('${APP_URL}:${APP_PORT}', '/goods/', i.file_name)) swiper FROM goods_img i WHERE i.goods_id = g.id) img
        FROM goods g
      `
      try {
        const [result] = await connection.execute(statement)
        return result
      } catch (error) {
        return error.message
      }
    }
  }

  // 读取图片信息
  async img(filename) {
    const statement = "SELECT * FROM goods_img WHERE file_name = ?"
    const [result] = await connection.execute(statement, [filename])
    return result
  }

  // 查询是否存在
  async countExist(userId, goodsId) {
    const statement = "SELECT * FROM users_goods WHERE user_id = ? AND goods_id = ?"
    try {
      const [result] = await connection.execute(statement, [userId, goodsId])
      return result
    } catch (error) {
      return error.message
    }
  }

  // 新建商品个数
  async createCount(id, goodsId, count) {
    const statement = "INSERT INTO users_goods (user_id, goods_id, count) VALUES (?, ?, ?);"
    try {
      const [result] = await connection.execute(statement, [id, goodsId, count])
      return result
    } catch (error) {
      return error.message
    }
  }

  // 修改商品个数
  async updateCount(id, goodsId, count) {
    const statement = "UPDATE users_goods SET count = ? WHERE user_id = ? AND goods_id = ?;"
    try {
      const [result] = await connection.execute(statement, [count, id, goodsId])
      return result
    } catch (error) {
      return error.message
    }
  }

  // 从购物车删除该商品
  async removeCount(id, goodsId) {
    const statement = "DELETE FROM users_goods WHERE user_id = ? AND goods_id = ?;"
    try {
      const [result] = await connection.execute(statement, [id, goodsId])
      return result
    } catch (error) {
      return error.message
    }
  }
}

module.exports = new GoodsService()