const { asyncRequest } = require('../util')
const { param, body, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const { getEthcalate } = require('../web3')

const validator = [param('id').exists(), body('ledgerChannelId').exists()]

const handler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() })
  }
  const { id, ledgerChannelId } = matchedData(req)

  const ethcalate = getEthcalate()

  await ethcalate.vcCloseFinal({
    virtualChannelId: parseInt(id, 10),
    ledgerChannelId
  })
  return res.status(200).json({
    message: 'VcCloseFinal called on contract',
    id
  })
}

module.exports.validator = validator
module.exports.handler = asyncRequest.bind(null, handler)
