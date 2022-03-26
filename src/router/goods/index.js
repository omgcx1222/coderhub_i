const Router = require('koa-router')
const { verifyToken } = require('../../common/common-middleware')
const { swiperImg, goodsList, getImg, addCount } = require('./middleware')

const goodsRouter = new Router({prefix: '/goods'})

goodsRouter.get('/swiper', swiperImg) // 轮播图
goodsRouter.get('/list', goodsList) // 商品列表
goodsRouter.get('/:filename', getImg) // 读取商品图片
goodsRouter.post('/', verifyToken, addCount) // 读取商品图片


module.exports = goodsRouter