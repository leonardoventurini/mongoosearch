import { ElasticsearchMethods } from './elasticsearch-methods'
import { Document } from 'mongoose'

export async function esUnset(
  this: ElasticsearchMethods & Document,
  fields: string[] | string,
) {
  const esOptions = this.esOptions()

  let body

  const fields$ = Array.isArray(fields) ? fields : [fields]

  if (esOptions.script) {
    body = {
      script: fields$.map(field => `ctx._source.remove("${field}")`).join(';'),
    }
  } else {
    body = { doc: {} }

    fields$.forEach(field => {
      body.doc[field] = null
    })
  }

  return esOptions.client.update({
    index: esOptions.index,
    id: this._id.toString(),
    body,
  })
}
