const abi = require('human-standard-token-abi')
const { asyncRequest } = require('../util')
const { param, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const { getEthcalate, getWeb3 } = require('../web3')

const validator = [param('id').exists()]

const handler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.mapped() })
  }
  let { id } = matchedData(req)

  const ethcalate = getEthcalate()
  const web3 = getWeb3()

  const channel = await ethcalate.getLedgerChannel(id)
  console.log('channel: ', channel)

  if (!channel) {
    return res.status(404).json({
      status: 'error',
      message: 'Channel not found.'
    })
  }

  if (channel.status !== 'open') {
    return res.status(400).json({
      status: 'error',
      message: 'Channel status is not "open".'
    })
  }

  const accounts = await web3.eth.getAccounts()

  if (channel.agentB !== accounts[0].toLowerCase()) {
    return res.status(400).json({
      message: 'Ingrid is not part of this channel.',
      status: 'error'
    })
  }

  let balance
  if (channel.tokenContract) {
    const tokenContract = new web3.eth.Contract(abi, channel.tokenContract)
    balance = await tokenContract.methods.balanceOf(accounts[0])
  } else {
    balance = await web3.eth.getBalance(accounts[0])
  }

  if (web3.utils.toBN(balance).lt(web3.utils.toBN(channel.depositA))) {
    return res.status(400).json({
      message: 'Not enough balance to join the ledger channel.',
      status: 'error'
    })
  }

  await ethcalate.joinChannel({
    channelId: id,
    tokenContract: channel.tokenContract,
    depositInWei: channel.depositA
  })

  res.status(200).json({
    status: 'success',
    data: { ledgerChannel: { id } }
  })
}

module.exports.validator = validator
module.exports.handler = asyncRequest.bind(null, handler)
