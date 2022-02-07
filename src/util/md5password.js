const crypot = require('crypto')

const md5password = (password) =>{
  const md5 = crypot.createHash('md5')
  const result = md5.update(password).digest('hex')

  return result
}

module.exports = md5password