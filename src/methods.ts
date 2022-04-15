import * as utils from './utils'
import { cloneDeep, isFunction, isString } from 'lodash'
import client from './client'
import Bulker from './bulker'
import { generate as generateMapping } from './mapping'
import { ElasticsearchMethods, PluginOptions } from './elasticsearch-plugin'
import { Document } from 'mongoose'

export function getIndexName(collectionName: string) {
  const lowercase = collectionName.toLowerCase()

  if (process.env.NODE_ENV === 'test') {
    return `test_${lowercase}`
  }

  if (process.env.NODE_ENV === 'development') {
    return `development_${lowercase}`
  }

  return lowercase
}

export const esOptions = options => {
  let options$ = null

  return function esOptions(): PluginOptions & {
    bulker: Bulker
    mapping: Record<string, any>
  } {
    if (options$) return options$

    options$ = cloneDeep(options)

    if (!options.index) {
      options$.index = getIndexName(this.collection.name)
    }

    if (!options$.index) {
      throw new Error('Missing collection name to build Elasticsearch index')
    }

    if (!options.client) {
      options$.client = client(options)
    }

    if (options.bulk) {
      options$.bulker = new Bulker(options.client, options.bulk)
    }

    options$.mapping = Object.freeze({
      properties: generateMapping(this.schema),
    })

    return options$
  }
}

export type Updater =
  | {
      /**
       * Fields to be removed.
       */
      unset?: string[]
    }
  | false

export async function esIndex(
  this: ElasticsearchMethods & Document,
  update?: Updater,
) {
  const esOptions = this.esOptions()

  let body = utils.serialize(this, (esOptions as any).mapping)

  if (isFunction(esOptions.transform)) {
    const transformedBody = esOptions.transform(body)

    if (transformedBody) {
      body = transformedBody
    }
  }

  if (update && update.unset) {
    const unset = isString(update.unset) ? [update.unset] : update.unset

    unset.forEach(field => {
      body[field] = null
    })
  }

  const payload = {
    index: esOptions.index,
    id: this._id.toString(),
    body: update ? { doc: body } : body,
  }

  return esOptions.client[update ? 'update' : 'index'](payload as any)
}
