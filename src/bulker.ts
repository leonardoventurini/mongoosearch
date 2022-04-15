import EventEmitter from 'events'
import { Client } from '@elastic/elasticsearch'
import { BulkOptions } from './elasticsearch-plugin'

/**
 * @event `error`: Emitted when bulk return an error.
 * @event `sent`: Emitted when bulk has sent a buffer.
 */
export default class Bulker extends EventEmitter {
  client: Client
  timeout: NodeJS.Timeout
  flushing = false
  delayMillis: number
  size: number
  buffer = []

  constructor(client: Client, { delay, size }: BulkOptions = {}) {
    super()

    this.client = client
    this.delayMillis = delay ?? 1000
    this.size = size ?? 1000
  }

  filled() {
    return Boolean(this.buffer.length)
  }

  isFlushing() {
    return this.flushing
  }

  delay() {
    clearTimeout(this.timeout)

    this.timeout = setTimeout(() => {
      this.flush()
    }, this.delayMillis)
  }

  flush() {
    const len = this.buffer.length

    clearTimeout(this.timeout)

    if (len) {
      this.flushing = true

      this.client.bulk(
        { body: this.buffer },
        err => {
          this.flushing = false

          if (err) {
            this.emit('error', err)
          } else {
            this.emit('sent', len)
          }
        },
      )
      this.buffer = []
    }
  }

  push() {
    let sending = false

    if (arguments.length) {
      this.buffer.push.apply(this.buffer, arguments)

      sending = this.buffer.length >= this.size

      if (sending) {
        this.flush()
      } else {
        this.delay()
      }
    }

    return sending
  }
}
