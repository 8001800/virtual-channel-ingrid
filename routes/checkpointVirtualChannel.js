const { asyncRequest } = require('../util')
const { param, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const decomposeToLedger = require('../helpers/decomposeToLedger')
const { getEthcalate } = require('../web3')

const validator = [param('id').exists()]

const handler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() })
  }
  const { id } = matchedData(req)

  const ethcalate = getEthcalate()

  const vc = await ethcalate.getLatestVirtualStateUpdate(id, ['sigA', 'sigB'])
  if (!vc.channel) {
    return res.status(404).json({
      message: 'Could not find channel'
    })
  }
  const { virtualtransactions } = vc.channel
  let finalBalanceA, finalBalanceB
  if (virtualtransactions) {
    // make sure tx is valid
    const { balanceA, balanceB } = virtualtransactions[0]
    // valid double signed tx to close with
    finalBalanceA = balanceA
    finalBalanceB = balanceB
    // TODO handle error case?
  } else {
    // final balances are deposits
    return res.status(400).json({
      message:
        'No double signed update exists for channel, nothing to checkpoint'
    })
  }

  await decomposeToLedger(vc.channel, {
    virtualBalanceA: finalBalanceA,
    virtualBalanceB: finalBalanceB
  })

  res.status(200).json({
    message: 'Ingrid sent ledger update for each subchannel.'
  })
}

module.exports.validator = validator
module.exports.handler = asyncRequest.bind(null, handler)
