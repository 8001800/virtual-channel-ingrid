const test = require('./test')
const requestVirtualChannel = require('./requestVirtualChannel')

module.exports = app => {
  // test
  app.route('/test').get(test.handler)

  // virtual channel
  app
    .route('/virtualchannel/:id')
    .post(requestVirtualChannel.validator)
    .post(requestVirtualChannel.handler)
}
