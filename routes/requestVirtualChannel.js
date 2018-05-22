const { asyncRequest } = require('../util')
const { param, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const { getModels } = require('../models')
const sendIngridOpeningCerts = require('../helpers/sendIngridOpeningCerts')
const closeVcAfterValidity = require('../helpers/closeVcAfterValidity')

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

  if (!sendIngridOpeningCerts(vc)) {
    return res.status(400).json({
      message: `Problem with opening certs`
    })
  }

  closeVcAfterValidity(vc)

  res.status(200).json({
    message:
      'Found certs and sent Ingrid opening cert, virtual channel is Opened'
  })
}

module.exports.validator = validator
module.exports.handler = asyncRequest.bind(null, handler)
