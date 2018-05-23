const { getEthcalate, getWeb3 } = require('../web3')

module.exports = async (
  virtualChannel,
  { virtualBalanceA, virtualBalanceB }
) => {
  let { id, depositA, depositB, subchanAtoI, subchanBtoI } = virtualChannel

  const ethcalate = getEthcalate()
  const web3 = getWeb3()

  const [
    { channel: ledgerChannelAtoI },
    { channel: ledgerChannelBtoI }
  ] = await Promise.all([
    ethcalate.getLedgerChannel(subchanAtoI),
    ethcalate.getLedgerChannel(subchanBtoI)
  ])

  let ledgerBalanceA, ledgerBalanceIA, ledgerBalanceIB, ledgerBalanceB
  if (
    ledgerChannelAtoI.transactions &&
    ledgerChannelAtoI.transactions.length > 0
  ) {
    const { balanceA, balanceB } = ledgerChannelAtoI.transactions[0]
    ledgerBalanceA = balanceA
    ledgerBalanceIA = balanceB
  } else {
    ledgerBalanceA = ledgerChannelAtoI.depositA
    ledgerBalanceIA = ledgerChannelAtoI.depositB
  }

  if (
    ledgerChannelBtoI.transactions &&
    ledgerChannelBtoI.transactions.length > 0
  ) {
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
  ledgerBalanceB = web3.utils.toBN(ledgerBalanceB)
  ledgerBalanceIB = web3.utils.toBN(ledgerBalanceIB)
  virtualBalanceA = web3.utils.toBN(virtualBalanceA)
  virtualBalanceB = web3.utils.toBN(virtualBalanceB)
  depositA = web3.utils.toBN(depositA)
  depositB = web3.utils.toBN(depositB)

  // decompose into A <=> I ledger channel
  let amtToTransfer
  switch (virtualBalanceA.cmp(depositA)) {
    case 0:
      // balance = deposit, do nothing
      break
    case -1:
      // balance < deposit
      // ledger balance A = ledgerbalance - (virtualdeposit - virtualbalance)
      // ledger balance B = ledgerbalance + (virtualdeposit - virtualbalance)
      amtToTransfer = depositA.sub(virtualBalanceA)
      ledgerBalanceA = ledgerBalanceA.sub(amtToTransfer)
      ledgerBalanceIA = ledgerBalanceIA.add(amtToTransfer)
      break
    case 1:
      // balance > deposit
      // ledger balance A = ledgerbalance + (virtualbalance - virtualdeposit)
      // ledger balance B = ledgerbalance - (virtualbalance - virtualdeposit)
      amtToTransfer = virtualBalanceA.sub(depositA)
      ledgerBalanceA = ledgerBalanceA.add(amtToTransfer)
      ledgerBalanceIA = ledgerBalanceIA.sub(amtToTransfer)
      break
  }

  // decompose into B <=> I ledger channel
  switch (virtualBalanceB.cmp(depositB)) {
    case 0:
      // balance = deposit, do nothing
      break
    case -1:
      // balance < deposit
      // ledger balance A = ledgerbalance - (virtualdeposit - virtualbalance)
      // ledger balance B = ledgerbalance + (virtualdeposit - virtualbalance)
      amtToTransfer = depositB.sub(virtualBalanceB)
      ledgerBalanceB = ledgerBalanceB.sub(amtToTransfer)
      ledgerBalanceIB = ledgerBalanceIB.add(amtToTransfer)
      break
    case 1:
      // balance > deposit
      // ledger balance A = ledgerbalance + (virtualbalance - virtualdeposit)
      // ledger balance B = ledgerbalance - (virtualbalance - virtualdeposit)
      amtToTransfer = virtualBalanceB.sub(depositB)
      ledgerBalanceB = ledgerBalanceB.add(amtToTransfer)
      ledgerBalanceIB = ledgerBalanceIB.sub(amtToTransfer)
      break
  }

  await ethcalate.updateLedgerState(
    {
      channelId: subchanAtoI,
      balanceA: ledgerBalanceA.toString(),
      balanceB: ledgerBalanceIA.toString(),
      virtualchannelId: id
    },
    true
  )

  await ethcalate.updateLedgerState(
    {
      channelId: subchanBtoI,
      balanceA: ledgerBalanceB.toString(),
      balanceB: ledgerBalanceIB.toString(),
      virtualchannelId: id
    },
    true
  )
}
