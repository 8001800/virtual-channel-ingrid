const Web3 = require('web3')
const artifacts = require('../artifacts/ChannelManager.json')
const Ethcalate = require('../../ethcalate-client/src')

let web3, channelManager, ethcalate

module.exports.initWeb3 = async () => {
  let accountAddress
  if (process.env.ETH_LOCAL) {
    console.log('Connecting to local ETH node')

    const port = process.env.ETH_PORT ? process.env.ETH_PORT : '9545'
    web3 = new Web3(`ws://localhost:${port}`)
    const accounts = await web3.eth.getAccounts()
    console.log('accounts: ', accounts)
    accountAddress = accounts[0]
    web3.eth.defaultAccount = accounts[0]
    console.log('defaultAccount: ', web3.eth.defaultAccount)
  } else {
    if (!process.env.ETH_KEY) {
      throw new Error(
        'No ETH private key detected, please configure one in the environment settings.'
      )
    }
    console.log(`Connecting to ETH node at ${process.env.ETH_NODE_URL}`)
    web3 = new Web3(process.env.ETH_NODE_URL)
    const account = web3.eth.accounts.privateKeyToAccount(process.env.ETH_KEY)
    web3.eth.accounts.wallet.add(account)
    accountAddress = web3.eth.accounts.wallet[0].address
    web3.eth.defaultAccount = accountAddress
    console.log('accountAddress: ', accountAddress)
  }
  const balance = await web3.eth.getBalance(accountAddress)
  console.log('balance: ', balance)
}

module.exports.getWeb3 = () => {
  if (!web3) {
    throw new Error('Problem connecting to web3')
  } else {
    return web3
  }
}

module.exports.initChannelManager = async channelManagerAddress => {
  if (!web3) {
    throw new Error('Web3 not found')
  } else {
    if (channelManagerAddress) {
      channelManager = new web3.eth.Contract(
        artifacts.abi,
        channelManagerAddress
      )
    } else {
      if (process.env.ETH_LOCAL) {
        // use truffle development address
        if (artifacts.networks['4447'].address) {
          console.log(
            `Found deployed contract at ${artifacts.networks['4447'].address}`
          )
          channelManager = new web3.eth.Contract(
            artifacts.abi,
            artifacts.networks['4447'].address
          )
        } else {
          throw new Error('No local deployment found')
        }
      } else {
        throw new Error('No contract address specified')
      }
    }
  }
}

module.exports.initEthcalate = async channelManagerAddress => {
  ethcalate = new Ethcalate(
    web3,
    channelManagerAddress,
    'http://localhost:3000'
  )
  await ethcalate.initContract()
}

module.exports.getEthcalate = () => {
  if (!ethcalate) {
    throw new Error('Problem initializing Ethcalate')
  } else {
    return ethcalate
  }
}

module.exports.getChannelManager = () => {
  if (!channelManager) {
    throw new Error('Problem initializing contract')
  } else {
    return channelManager
  }
}
