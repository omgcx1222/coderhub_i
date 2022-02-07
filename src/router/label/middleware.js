const { list } = require('./service')

class LabelMiddleware {
  async labelList(ctx, next) {
    const result = await list()

    ctx.body = result
  }
}

module.exports = new LabelMiddleware()