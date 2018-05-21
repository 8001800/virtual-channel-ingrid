const { Op } = require('sequelize')
const { getModels } = require('../models')
const Ethcalate = require('../../ethcalate-testing/src/src')
const { getEthcalate, getWeb3 } = require('../web3')

module.exports = virtualChannel => {
  let {
    id,
    agentA,
    agentB,
    validity,
    depositA,
    depositB,
    subchanAtoI,
    subchanBtoI
  } = virtualChannel
  const ethcalate = getEthcalate()
  const web3 = getWeb3()

  setTimeout(async () => {
    const vc = ethcalate.getLatestVirtualStateUpdate(id, ['sigA', 'sigB'])
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

    const [
      { channel: ledgerChannelAtoI },
      { channel: ledgerChannelBtoI }
    ] = await Promise.all([
      ethcalate.getLedgerChannel(subchanAtoI),
      ethcalate.getLedgerChannel(subchanBtoI)
    ])

    let ledgerBalanceA, ledgerBalanceIA, ledgerBalanceIB, ledgerBalanceB
    if (ledgerChannelAtoI.transactions) {
      const { balanceA, balanceB } = ledgerChannelAtoI.transactions[0]
      ledgerBalanceA = balanceA
      ledgerBalanceIA = balanceB
    } else {
      ledgerBalanceA = ledgerChannelAtoI.depositA
      ledgerBalanceIA = ledgerChannelAtoI.depositB
    }

    if (ledgerChannelBtoI.transactions) {
      const { balanceA, balanceB } = ledgerChannelBtoI.transactions[0]
      ledgerBalanceB = balanceA
      ledgerBalanceIB = balanceB
    } else {
      ledgerBalanceB = ledgerChannelBtoI.depositA
      ledgerBalanceIB = ledgerChannelBtoI.depositB
    }

    // get BNs
    ledgerBalanceA = web3.utils.toBN(ledgerBalanceA)
    ledgerBalanceIA = web3.utils.toBN(ledgerBalanceIA)
    finalBalanceA = web3.utils.toBN(finalBalanceA)
    finalBalanceB = web3.utils.toBN(finalBalanceB)
    depositA = web3.utils.toBN(depositA)
    depositB = web3.utils.toBN(depositB)

    // decompose into A <=> I ledger channel
    let amtToTransfer
    switch (finalBalanceA.cmp(depositA)) {
      case 0:
        // balance = deposit, do nothing
        break
      case -1:
        // balance < deposit
        // ledger balance A = ledgerbalance - (virtualdeposit - virtualbalance)
        // ledger balance B = ledgerbalance + (virtualdeposit - virtualbalance)
        amtToTransfer = depositA.sub(finalBalanceA)
        ledgerBalanceA = ledgerBalanceA.sub(amtToTransfer)
        ledgerBalanceIA = ledgerBalanceIA.add(amtToTransfer)
        break
      case 1:
        // balance > deposit
        // ledger balance A = ledgerbalance + (virtualbalance - virtualdeposit)
        // ledger balance B = ledgerbalance - (virtualbalance - virtualdeposit)
        amtToTransfer = finalBalanceA.sub(depositA)
        ledgerBalanceA = ledgerBalanceA.add(amtToTransfer)
        ledgerBalanceIA = ledgerBalanceIA.sub(amtToTransfer)
        break
    }

    // decompose into B <=> I ledger channel
    switch (finalBalanceB.cmp(depositB)) {
      case 0:
        // balance = deposit, do nothing
        break
      case -1:
        // balance < deposit
        // ledger balance A = ledgerbalance - (virtualdeposit - virtualbalance)
        // ledger balance B = ledgerbalance + (virtualdeposit - virtualbalance)
        amtToTransfer = depositB.sub(finalBalanceB)
        ledgerBalanceB = ledgerBalanceB.sub(amtToTransfer)
        ledgerBalanceIB = ledgerBalanceIB.add(amtToTransfer)
        break
      case 1:
        // balance > deposit
        // ledger balance A = ledgerbalance + (virtualbalance - virtualdeposit)
        // ledger balance B = ledgerbalance - (virtualbalance - virtualdeposit)
        amtToTransfer = finalBalanceB.sub(depositB)
        ledgerBalanceB = ledgerBalanceB.sub(amtToTransfer)
        ledgerBalanceIB = ledgerBalanceIB.add(amtToTransfer)
        break
    }

    await ethcalate.updateLedgerState(
      {
        channelId: subchanAtoI,
        balanceA: ledgerBalanceA,
        balanceB: ledgerBalanceIA
      },
      true
    )

    await ethcalate.updateLedgerState(
      {
        channelId: subchanBtoI,
        balanceA: ledgerBalanceB,
        balanceB: ledgerBalanceIB
      },
      true
    )
  }, validity * 1000)
}
