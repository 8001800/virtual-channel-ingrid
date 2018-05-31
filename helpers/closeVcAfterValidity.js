const { getEthcalate } = require('../web3')
const { getModels } = require('../models')
const decomposeToLedger = require('./decomposeToLedger')

module.exports = virtualChannel => {
  let { id, validity, depositA, depositB } = virtualChannel
  const ethcalate = getEthcalate()
  validity = parseInt(validity)

  setTimeout(async () => {
    const vcState = await ethcalate.getLatestVirtualStateUpdate(id, [
      'sigA',
      'sigB'
    ])
    const { virtualtransactions } = vcState
    let finalBalanceA, finalBalanceB
    let nonce = 0
    if (virtualtransactions) {
      // make sure tx is valid
      const { balanceA, balanceB, nonce: vtNonce } = virtualtransactions[0]
      // valid double signed tx to close with
      finalBalanceA = balanceA
      finalBalanceB = balanceB
      nonce = vtNonce
      // TODO handle error case?
    } else {
      // final balances are deposits
      finalBalanceA = depositA
      finalBalanceB = depositB
    }

    await decomposeToLedger(virtualChannel, {
      virtualBalanceA: finalBalanceA,
      virtualBalanceB: finalBalanceB,
      nonce
    })
    // update vc status to closed
    const { VirtualChannel } = getModels()
    const vc = await VirtualChannel.findById(id)
    vc.status = 'Closed'
    await vc.save()
  }, validity * 1000)
}
