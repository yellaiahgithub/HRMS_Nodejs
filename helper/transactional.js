const mongoose = require('mongoose')
const logger = require('../common/logging/services/logger').loggers.get('Transactional')

exports.transactional =
  (wrapped) =>
  (...args) =>
    (async () => {
      let session = null
      try {
        session = await mongoose.startSession()
        await session.startTransaction()
        logger.info('---- TRANSACTION BEGIN -----')
        const updatedArgs = [...args, session]
        const result = await wrapped.apply(this, updatedArgs)
        await session.commitTransaction()
        logger.info('---- TRANSACTION COMMIT -----')
        return result
      } catch (error) {
        logger.error('----TRANSACTION ROLLBACK------', error)
        await session.abortTransaction()
        throw new Error(error)
      } finally {
        if (session) {
          await session.endSession()
        }
      }
    })()
