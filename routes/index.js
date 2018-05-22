const test = require('./test')
const requestVirtualChannel = require('./requestVirtualChannel')
const checkpointVirtualChannel = require('./checkpointVirtualChannel')

module.exports = app => {
  // test
  app.route('/test').get(test.handler)

  // virtual channel
  app
    .route('/virtualchannel/id/:id/open')
    .post(requestVirtualChannel.validator)
    .post(requestVirtualChannel.handler)

  app
    .route('/virtualchannel/id/:id/checkpoint')
    .post(checkpointVirtualChannel.validator)
    .post(checkpointVirtualChannel.handler)
}
