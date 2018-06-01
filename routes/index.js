const test = require('./test')
const requestVirtualChannel = require('./requestVirtualChannel')
const checkpointVirtualChannel = require('./checkpointVirtualChannel')
const vcCloseInit = require('./vcCloseInit')
const vcCloseFinal = require('./vcCloseFinal')
const vcCloseFinalTimeout = require('./vcCloseFinalTimeout')
const joinLedgerChannel = require('./joinLedgerChannel')

module.exports = app => {
  // test
  app.route('/test').get(test.handler)

  // virtual channel
  app
    .route('/virtualchannel/:id/open')
    .post(requestVirtualChannel.validator)
    .post(requestVirtualChannel.handler)

  app
    .route('/virtualchannel/:id/checkpoint')
    .post(checkpointVirtualChannel.validator)
    .post(checkpointVirtualChannel.handler)

  app
    .route('/virtualchannel/:id/vccloseinit')
    .post(vcCloseInit.validator)
    .post(vcCloseInit.handler)

  app
    .route('/virtualchannel/:id/vcclosefinal')
    .post(vcCloseFinal.validator)
    .post(vcCloseFinal.handler)

  app
    .route('/virtualchannel/:id/vcclosefinaltimeout')
    .post(vcCloseFinalTimeout.validator)
    .post(vcCloseFinalTimeout.handler)

  app
    .route('/ledgerchannel/:id/join')
    .post(joinLedgerChannel.validator)
    .post(joinLedgerChannel.handler)
}
