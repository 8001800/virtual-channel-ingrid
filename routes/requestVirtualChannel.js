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
    return res.status(422).json({ status: 'error', errors: errors.mapped() })
  }
  let { id } = matchedData(req)
  id = parseInt(id)

  const { VirtualChannel } = getModels()

  const vc = await VirtualChannel.findById(id)
  if (!vc) {
    return res.status(404).json({
      status: 'error',
      message: `Could not find channel id: ${id}`
    })
  }

  if (!(await sendIngridOpeningCerts(vc))) {
    return res.status(400).json({
      status: 'error',
      message: `Problem with opening certs, channel will be set to NotOpened after delta`
    })
  }

  closeVcAfterValidity(vc)

  res.status(200).json({
    status: 'success',
    data: null
  })
}

module.exports.validator = validator
module.exports.handler = asyncRequest.bind(null, handler)
