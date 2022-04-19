import { Client } from '@elastic/elasticsearch'

export default function (options) {
  const opts = {} as any

  if (Array.isArray(options.hosts)) {
    opts.host = options.hosts
  } else {
    opts.host = {
      host: options.host || '127.0.0.1',
      port: options.port || 9200,
      protocol: options.protocol || 'http',
      auth: options.auth || null,
      keepAlive: false,
    }
  }

  opts.log = options.log || null

  return new Client(opts)
}
