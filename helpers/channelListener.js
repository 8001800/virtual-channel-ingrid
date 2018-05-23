const { getChannelManager, getWeb3, getEthcalate } = require('../web3')

async function processChannelOpen (
  { channelId, agentB, tokenContract, depositA },
  ethcalate,
  defaultAccount
) {
  if (agentB === defaultAccount) {
    console.log(
      'Found a channel opened with Ingrid, Ingrid will automatically join'
    )
    if (!tokenContract || parseInt(tokenContract) === 0) {
      try {
        const { channel } = await ethcalate.getLedgerChannel(channelId)
        if (channel.status === 'opened') {
          await ethcalate.joinChannel({
            channelId,
            tokenContract: null,
            depositInWei: depositA
          })
          console.log(`Joined channel ${channelId} as Ingrid`)
        } else {
          console.log(`Found channel with status ${channel.status}`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = async contractAddress => {
  const web3 = getWeb3()
  const channelManager = getChannelManager()
  const ethcalate = getEthcalate()
  await ethcalate.initContract()

  channelManager.events.allEvents(async (err, event) => {
    if (err) {
      console.log(err)
      return
    }
    const channelAttributes = {
      ...event.returnValues
    }
    switch (event.event) {
      case 'ChannelOpen':
        console.log('caught ChannelOpen', channelAttributes)
        await processChannelOpen(
          channelAttributes,
          ethcalate,
          web3.eth.defaultAccount
        )
        break
    }
  })

  channelManager
    .getPastEvents('allEvents', { fromBlock: 0 })
    .then(async events => {
      events.map(async event => {
        const channelAttributes = {
          ...event.returnValues
        }
        switch (event.event) {
          case 'ChannelOpen':
            console.log('caught ChannelOpen', channelAttributes)
            await processChannelOpen(
              channelAttributes,
              ethcalate,
              web3.eth.defaultAccount
            )
            break
        }
      })
    })
}
