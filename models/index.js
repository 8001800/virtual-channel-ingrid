const Sequelize = require('sequelize')

console.log(
  `Connecting to db at ${process.env.RDS_HOSTNAME}, using ${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}, table name: ${process.env.RDS_DB_NAME}`
)

let sequelize,
  User,
  Transaction,
  Channel,
  VirtualChannel,
  Certificate,
  VirtualTransaction

module.exports.connectDb = async () => {
  sequelize = new Sequelize(
    process.env.RDS_DB_NAME,
    process.env.RDS_USERNAME,
    process.env.RDS_PASSWORD,
    {
      host: process.env.RDS_HOSTNAME,
      dialect: 'postgres',
      operatorsAliases: false,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      port: 5432
    }
  )
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')

  // tables
  User = sequelize.import('../models/user.model.js')
  Transaction = sequelize.import('../models/transaction.model.js')
  Channel = sequelize.import('../models/channel.model.js')
  VirtualChannel = sequelize.import('../models/virtualchannel.model.js')
  VirtualTransaction = sequelize.import('../models/virtualtransaction.model.js')
  Certificate = sequelize.import('../models/certificate.model.js')

  if (process.env.INIT_DB) {
    await User.sync({ force: true })
    await Transaction.sync({ force: true })
    await Channel.sync({ force: true })
    await VirtualChannel.sync({ force: true })
    await VirtualTransaction.sync({ force: true })
    await Certificate.sync({ force: true })
  }

  // relations
  Transaction.belongsTo(Channel)
  Channel.hasMany(Transaction)
  Certificate.belongsTo(VirtualChannel)
  VirtualTransaction.belongsTo(VirtualChannel)
  VirtualChannel.hasMany(Certificate)
  VirtualChannel.hasMany(VirtualTransaction)
}

module.exports.getDb = () => {
  if (!sequelize) {
    throw new Error('Database connection error.')
  }
  return sequelize
}

module.exports.getModels = () => {
  return {
    User,
    Transaction,
    Channel,
    VirtualChannel,
    Certificate,
    VirtualTransaction
  }
}
