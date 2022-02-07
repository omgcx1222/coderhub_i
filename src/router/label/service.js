const connection = require('../../app/database')

class LabelService {
  async list() {
    const statement = "SELECT * FROM label"
    const result = await connection.execute(statement)
    
    return result[0]
  }
}

module.exports = new LabelService()