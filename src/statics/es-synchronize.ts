import mongoose from 'mongoose'
import Bulker from '../bulker'
import * as utils from '../utils'
import { esLog } from '../utils'
import chalk from 'chalk'

export function esSynchronize(conditions, projection, options) {
  const model = this

  return new Promise((resolve, reject) => {
    const start = Date.now()
    const esOptions = model.esOptions()
    const batch = esOptions?.bulk?.batch ?? 50

    esLog(`started synchronizing ${chalk.cyan(esOptions.index)}`)

    let query

    if (conditions instanceof mongoose.Query) {
      query = conditions.lean().batchSize(batch)
    } else {
      query = model
        .find(conditions || {}, projection, options)
        .lean()
        .batchSize(batch)
    }

    const stream = query.cursor()

    const bulker = esOptions.bulker || new Bulker(esOptions.client)

    let streamClosed = false

    function finalize() {
      bulker.removeListener('error', onError)
      bulker.removeListener('sent', onSent)

      esOptions.client.indices.refresh(
        { index: esOptions.index },
        (err, result) => {
          esLog(
            `finished synchronizing ${chalk.cyan(esOptions.index)} ${chalk.gray(
              Date.now() - start,
              'ms',
            )}`,
          )

          err ? reject(err) : resolve(result)
        },
      )
    }

    function onError(err) {
      model.emit('es-bulk-error', err)
      if (streamClosed) {
        finalize()
      } else {
        stream.resume()
      }
    }

    function onSent(len) {
      model.emit('es-bulk-sent', len)
      if (streamClosed) {
        finalize()
      } else {
        stream.resume()
      }
    }

    bulker.on('error', onError)
    bulker.on('sent', onSent)

    stream.on('data', doc => {
      stream.pause()

      let sending

      if (!esOptions.filter || esOptions.filter(doc)) {
        sending = bulker.push(
          {
            index: {
              _index: esOptions.index,
              _type: esOptions.type,
              _id: doc._id.toString(),
            },
          },
          utils.serialize(doc, esOptions.mapping),
        )

        model.emit('es-bulk-data', doc)
      } else {
        model.emit('es-bulk-filtered', doc)
      }

      if (!sending) {
        stream.resume()
      }
    })

    stream.on('end', () => {
      streamClosed = true

      if (bulker.filled()) {
        bulker.flush()
      } else if (!bulker.isFlushing()) {
        finalize()
      }
    })
  })
}
