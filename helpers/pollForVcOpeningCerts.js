const { getModels } = require('../models')
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
    // recover signer and make sure both agents submitted signed certs
    certs.forEach(cert => {
      console.log(`Found opening certs from ${cert.from}`)
      const signer = ethcalate.recoverSignerFromOpeningCerts(
        cert.sig,
        virtualChannel
      )
      switch (signer) {
        case agentA:
        case agentB:
          found[signer] = true
          break
      }
    })
    if (found[agentA] && found[agentB]) {
      const certs = await ethcalate.createOpeningCerts(virtualChannel, true)
      console.log('Ingrid created certs after finding other certs: ', certs)

      // TODO send certs to DB

      clearInterval(intervalId)
    }
    if (counter >= NUM_POLLING_INTERVALS) {
      console.log('Could not find opening certs within total polling time.')
      clearInterval(intervalId)
    }
    counter++
  }, 5000)
}
