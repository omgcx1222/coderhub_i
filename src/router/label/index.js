const Router = require('koa-router')

const { labelList } = require('./middleware')

const labelRouter = new Router({prefix: '/label'})

labelRouter.get('/', labelList)

module.exports = labelRouter