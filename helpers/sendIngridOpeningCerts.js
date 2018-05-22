const { getModels } = require('../models')
const Ethcalate = require('../../ethcalate-testing/src/src')
const { getEthcalate } = require('../web3')

module.exports = async virtualChannel => {
  const { id, agentA, agentB, ingrid, depositA, depositB } = virtualChannel
  const { Certificate } = getModels()
  const ethcalate = getEthcalate()

  const found = {
    [agentA]: false,
    [agentB]: false
  }
  console.log('Checking database for opening certs')
  const certs = await Certificate.findAll({
    where: {
      virtualchannelId: id
    }
  })
  // recover signer and make sure both agents submitted signed certs
  certs.forEach(cert => {
    console.log(`Found opening certs from ${cert.from}`)
    let sigParams
    switch (cert.from) {
      case agentA:
        sigParams = {
          id,
          agentA,
          agentB,
          ingrid,
          participantType: 'agentA',
          depositInWei: depositA
        }
        break
      case agentB:
        sigParams = {
          id,
          agentA,
          agentB,
          ingrid,
          participantType: 'agentB',
          depositInWei: depositB
        }
        break
    }
    const signer = Ethcalate.recoverSignerFromOpeningCerts(cert.sig, sigParams)
    if (signer === cert.from) {
      found[signer] = true
    } else {
      console.log(
        `Found invalid cert id: ${cert.id}, signer: ${signer}, cert.from: ${cert.from}`
      )
    }
  })
  if (found[agentA] && found[agentB]) {
    // has both certs, cosigns opening certs
    // const cosigned = await ethcalate.cosignOpeningCert({
    //   certID: cert.id,
    //   vcID: id
    // })
    const cosigned = true // remove once ^^ works
    if (cosigned) {
      // I successfully cosigned certificate
      // generate opening certs
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
      await ethcalate.sendOpeningCerts(id, certs)
      await ethcalate.updateVirtualChannelStatus({ id, status: 'opened' })
      return true
    } else {
      console.log('Ingrid did not successfully sign opening certs.')
      return false
    }
  } else {
    await ethcalate.checkVcOpeningCerts(virtualChannel)
    return false
  }
}
