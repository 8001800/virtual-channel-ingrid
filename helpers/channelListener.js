const { getChannelManager } = require('../web3')
const { getModels } = require('../models')

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
  const channelManager = getChannelManager()

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
