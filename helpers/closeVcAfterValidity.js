const { getEthcalate } = require('../web3')
const decomposeToLedger = require('./decomposeToLedger')

module.exports = virtualChannel => {
  let { id, validity, depositA, depositB } = virtualChannel
  const ethcalate = getEthcalate()
  validity = parseInt(validity)

  setTimeout(async () => {
    const vc = await ethcalate.getLatestVirtualStateUpdate(id, ['sigA', 'sigB'])
    const { virtualtransactions } = vc
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
  }, validity * 1000)
}
