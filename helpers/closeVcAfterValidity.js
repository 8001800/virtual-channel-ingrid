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
    if (virtualtransactions) {
      // make sure tx is valid
      const { balanceA, balanceB } = virtualtransactions[0]
      // valid double signed tx to close with
      finalBalanceA = balanceA
      finalBalanceB = balanceB
      // TODO handle error case?
    } else {
      // final balances are deposits
      finalBalanceA = depositA
      finalBalanceB = depositB
    }

    await decomposeToLedger(virtualChannel, {
      virtualBalanceA: finalBalanceA,
      virtualBalanceB: finalBalanceB
    })
  }, validity * 1000)
}
