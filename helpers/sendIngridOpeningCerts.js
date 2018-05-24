const { getModels } = require('../models')
const Ethcalate = require('../../ethcalate-testing/src/src')
const { getEthcalate } = require('../web3')

module.exports = async virtualChannel => {
  const {
    id,
    agentA,
    agentB,
    ingrid,
    depositA,
    depositB,
    subchanAtoI,
    subchanBtoI,
    closingTimeSeconds
  } = virtualChannel
  const { Certificate } = getModels()
  const ethcalate = getEthcalate()

  console.log('subchanAtoI: ', subchanAtoI)
  console.log('subchanBtoI: ', subchanBtoI)

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
          depositInWei: depositA,
          subchanAtoI,
          subchanBtoI,
          closingTimeSeconds
        }
        break
      case agentB:
        sigParams = {
          id,
          agentA,
          agentB,
          ingrid,
          participantType: 'agentB',
          depositInWei: depositB,
          subchanAtoI,
          subchanBtoI,
          closingTimeSeconds
        }
        break
    }
    console.log('sigParams: ', sigParams)
    if (sigParams) {
      const signer = Ethcalate.recoverSignerFromOpeningCerts(
        cert.sig,
        sigParams
      )
      if (signer === cert.from) {
        found[signer] = true
      } else {
        console.log(
          `Found invalid cert id: ${cert.id}, signer: ${signer}, cert.from: ${
            cert.from
          }`
        )
      }
    }
  })
  if (found[agentA] && found[agentB]) {
    // has both certs, cosigns opening certs
    try {
      await ethcalate.cosignOpeningCerts({
        certA: certs[0].from === agentA ? certs[0].sig : certs[1].sig,
        certB: certs[0].from === agentA ? certs[1].sig : certs[0].sig,
        id
      })
    } catch (e) {
      console.log('Ingrid did not successfully sign opening certs.')
      return false
    }

    // I successfully cosigned certificate
    // generate opening certs
    const ingridCerts = await ethcalate.createOpeningCerts(
      {
        id,
        agentA,
        agentB,
        ingrid,
        depositInWei: '0',
        participantType: 'ingrid',
        subchanAtoI,
        subchanBtoI,
        closingTimeSeconds
      },
      true
    )
    console.log(
      'Ingrid created certs after finding and signing other certs: ',
      ingridCerts
    )
    await ethcalate.sendOpeningCerts(id, ingridCerts)
    await ethcalate.updateVirtualChannelStatus({ id, status: 'opened' })
    return true
  } else {
    await ethcalate.checkVcOpeningCerts(virtualChannel)
    return false
  }
}
