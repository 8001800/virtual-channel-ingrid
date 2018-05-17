const { getModels } = require('../models')
const Ethcalate = require('../../ethcalate-testing/src/src')
const { getEthcalate } = require('../web3')

const TOTAL_POLLING_TIME = 3600 * 1000
const POLLING_FREQUENCY = 5 * 1000
// const NUM_POLLING_INTERVALS = TOTAL_POLLING_TIME / POLLING_FREQUENCY
const NUM_POLLING_INTERVALS = 1

module.exports = async virtualChannel => {
  const { id, agentA, agentB } = virtualChannel
  const { Certificate } = getModels()
  const ethcalate = getEthcalate()

  const found = {
    [agentA]: false,
    [agentB]: false
  }
  let counter = 0
  const intervalId = setInterval(async () => {
    console.log('Checking database for opening certs')
    const certs = await Certificate.findAll({
      where: {
        virtualchannelId: id
      }
    })
    const { agentA, agentB, ingrid, depositA, depositB } = virtualChannel
    // recover signer and make sure both agents submitted signed certs
    certs.forEach(cert => {
      console.log(`Found opening certs from ${cert.from}`)
      let signer
      switch (cert.from) {
        case agentA:
          signer = Ethcalate.recoverSignerFromOpeningCerts(cert.sig, {
            id,
            agentA,
            agentB,
            ingrid,
            participantType: 'agentA',
            depositInWei: depositA
          })
          if (signer === agentA) {
            found[signer] = true
          } else {
            console.log(`Invalid cert signature: ${cert.id}`)
          }
          break
        case agentB:
          signer = Ethcalate.recoverSignerFromOpeningCerts(cert.sig, {
            id,
            agentA,
            agentB,
            ingrid,
            participantType: 'agentB',
            depositInWei: depositB
          })
          if (signer === agentB) {
            found[signer] = true
          } else {
            console.log(`Invalid cert signature: ${cert.id}`)
          }
          break
      }
    })
    if (found[agentA] && found[agentB]) {
      const certs = await ethcalate.createOpeningCerts(
        {
          id,
          agentA,
          agentB,
          ingrid,
          depositInWei: '0',
          participantType: 'ingrid'
        },
        true
      )
      console.log('Ingrid created certs after finding other certs: ', certs)
      clearInterval(intervalId)
      await ethcalate.sendOpeningCerts(id, certs)
    }
    if (counter >= NUM_POLLING_INTERVALS) {
      console.log('Could not find opening certs within total polling time.')
      clearInterval(intervalId)
    }
    counter++
  }, 5000)
}
