/**
 * Wraps express.js async handler function with catch to correctly handle errors
 * @param  {Function} asyncFn   async handler function for express
 * @param  {Object} req         express request object
 * @param  {Object} res         express response object
 * @return {void}
 */
module.exports.asyncRequest = (asyncFn, req, res) =>
  asyncFn(req, res).catch(e => {
    console.error(e)
    res.status(500).json({ message: e.message })
  })
