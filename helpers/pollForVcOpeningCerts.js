const { getModels } = require('../models')
const { getEthcalate } = require('../web3')

module.exports = virtualChannel => {
  const { id, agentA, agentB, ingrid } = virtualChannel
  const { Certificate } = getModels()
  const ethcalate = getEthcalate()
  console.log('Checking database for opening certs')
  const found = {
    agentA: false,
    agentB: false,
    ingrid: false
  }
  const intervalId = setInterval(async () => {
    const certs = await Certificate.findAll({
      where: {
        virtualchannelId: id
      }
    })
    const addresses = certs.forEach(cert => {
      console.log(`Found opening certs from ${addresses}`)
      switch (cert.from) {
        case agentA:
        case agentB:
        case ingrid:
          found[cert.from] = true
          break
      }
    })
    if (found.agentA && found.agentB && found.ingrid) {
      const certs = await ethcalate.createOpeningCerts(virtualChannel, true)
      console.log('Ingrid created certs after finding other certs: ', certs)

      // TODO send certs to DB

      clearInterval(intervalId)
    }
  }, 5000)
}
