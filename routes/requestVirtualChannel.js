const { asyncRequest } = require('../util')
const { param, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const { getModels } = require('../models')
const pollVc = require('../helpers/pollForVcOpeningCerts')

const validator = [param('id').exists()]

const handler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() })
  }
  const { id } = matchedData(req)

  const { VirtualChannel } = getModels()

  const vc = await VirtualChannel.findById(id)
  if (!vc) {
    return res.status(404).json({
      message: `Could not find channel id: ${id}`
    })
  }

  pollVc(vc)

  res.status(200).json({
    message: 'Request received, polling for opening certs'
  })
}

module.exports.validator = validator
module.exports.handler = asyncRequest.bind(null, handler)
