const { asyncRequest } = require('../util')

const handler = async (req, res) => {
  res.status(200).json({ message: 'Test success' })
}

module.exports.handler = asyncRequest.bind(null, handler)
