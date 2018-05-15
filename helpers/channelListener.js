const { getChannelManager, getWeb3 } = require('../web3')
const { getModels } = require('../models')
const Ethcalate = require('../../ethcalate-client/src')

async function processChannelOpen ({
  channelId,
  agentA,
  agentB,
  tokenContract,
  depositA,
  challenge,
  channelManagerAddress
}) {}

module.exports = async contractAddress => {
  const web3 = getWeb3()
  const channelManager = getChannelManager()
  const ethcalate = new Ethcalate(
    web3,
    contractAddress,
    'http://localhost:3000'
  )
  console.log('ethcalate: ', ethcalate)

  channelManager.events.allEvents(async (err, event) => {
    if (err) {
      console.log(err)
      return
    }
    const channelAttributes = {
      ...event.returnValues,
      channelManagerAddress: channelManager.options.address.toLowerCase()
    }
    switch (event.event) {
      case 'ChannelOpen':
        console.log('caught ChannelOpen', channelAttributes)
        await processChannelOpen(channelAttributes)
        break
    }
  })
}
