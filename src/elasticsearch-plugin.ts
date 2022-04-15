import {
  Document,
  EnforceDocument,
  FilterQuery,
  Model,
  QueryOptions,
  QueryWithHelpers,
} from 'mongoose'
import * as utils from './utils'
import { clone } from 'lodash'
import { esIndex, esOptions, Updater } from './methods'
import {
  ApiResponse,
  Context,
  RequestBody,
  TransportRequestPromise,
} from '@elastic/elasticsearch/lib/Transport'
import { Client } from '@elastic/elasticsearch'
import {
  CreateMappingOptions,
  esCreateMapping,
} from './statics/es-create-mapping'
import * as T from '@elastic/elasticsearch/api/types'
import { esExists } from './statics/es-exists'
import { esDeleteIndex } from './statics/es-delete-index'
import { esCount } from './statics/es-count'
import { esSynchronize } from './statics/es-synchronize'
import { esSearch, ESSearchOptions } from './statics/es-search'
import { esRefresh } from './statics/es-refresh'

async function unsetFields(
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

async function esRemove(this: ElasticsearchMethods & Document) {
  const esOptions = this.esOptions()

  return esOptions.client.delete({
    index: esOptions.index,
    id: this._id.toString(),
  })
}

async function preSave() {
  this._mexp = {
    wasNew: this.isNew,
  }
  if (!this.isNew) {
    this._mexp.unset = utils.getUndefineds(this, this.esOptions().mapping)
  }
}

async function postSave(doc) {
  if (doc && doc.esOptions) {
    const data = doc._mexp || {}
    const esOptions = doc.esOptions()

    delete doc._mexp

    if (!esOptions.filter || esOptions.filter(doc)) {
      try {
        let res = await doc.esIndex(data.wasNew ? false : { unset: data.unset })

        res =
          esOptions.script && data.unset?.length ? doc.esUnset(data.unset) : res

        doc.emit('es-indexed', undefined, res)
        doc.constructor.emit('es-indexed', undefined, res)
      } catch (err) {
        doc.emit('es-indexed', err)
        doc.constructor.emit('es-indexed', err)
      }
    } else {
      doc.emit('es-filtered')
      doc.constructor.emit('es-filtered')

      if (!data.wasNew) {
        const res = await doc.esRemove()

        doc.emit('es-removed', res)
        doc.constructor.emit('es-removed', res)
      }
    }
  }
}

async function postRemove(doc) {
  if (doc && doc.esOptions) {
    const res = await doc.esRemove()

    doc.emit('es-removed', res)
    doc.constructor.emit('es-removed', res)
  }
}

export type BulkOptions = {
  /**
   * Batch size to use on synchronise options. Defaults to 50.
   *
   * https://docs.mongodb.com/manual/reference/method/cursor.batchSize/
   */
  batch?: number

  /**
   * Bulk element count to wait before calling client.bulk function. Defaults
   * to 1000.
   */
  size?: number

  /**
   * Idle time to wait before calling the client.bulk function. Defaults to
   * 1000.
   */
  delay?: number
}

export type PluginOptions = {
  /**
   * The index in Elasticsearch to use. Defaults to the collection name.
   */
  index?: string

  /**
   * An existing Elasticsearch Client instance.
   */
  client?: Client

  /**
   * An array hosts Elasticsearch is running on.
   */
  hosts?: string[]

  /**
   * The host Elasticsearch is running on.
   */
  host?: string

  /**
   * The port Elasticsearch is running on.
   */
  port?: number

  /**
   * The authentication needed to reach Elasticsearch server. In the standard
   * format of 'username:password'.
   */
  auth?: string

  /**
   * The protocol the Elasticsearch server uses. Defaults to http.
   */
  protocol?: string

  /**
   * Whether or not to replace ES source by mongo document.
   */
  hydrate?: boolean

  /**
   * Whether or not returning only mongo ids in esSearch.
   */
  idsOnly?: boolean

  /**
   * Whether or not returning only the count value in esCount
   */
  countOnly?: boolean

  /**
   *  Time in milliseconds to wait after esRefresh. Defaults to 0.
   */
  refreshDelay?: number

  /**
   * Whether or not the inline script are enabled in elasticsearch. Defaults to
   * false.
   */
  script?: boolean

  /**
   * Whether or not to demand indexing on CRUD operations. If set to true
   * middleware hooks for save, update, delete do not fire. Defaults to false.
   */
  esManualIndexing?: boolean

  /**
   * Options to use when synchronising.
   */
  bulk?: BulkOptions

  /**
   * The function used for filtered indexing.
   */
  filter?(doc: Document): boolean

  /**
   * The function used for transforming a document before indexing it, accepts
   * the document as an argument, expects transformed document to be returned
   * (if returned value is falsy, the original document will be used).
   */
  transform?(doc: Document): Record<string, any> | false
}

export interface ElasticsearchModel<
  TSchema = any,
  TQueryHelpers = any,
  TMethods = any,
> extends Model<TSchema, TQueryHelpers, TMethods> {
  esOptions(): PluginOptions

  /**
   * This needs to run in order to create the index the first time, or after
   * deleting/re-creating it.
   */
  esCreateMapping(
    opts?: CreateMappingOptions,
  ): TransportRequestPromise<ApiResponse<T.IndicesPutMappingResponse>>

  esRefresh<
    TResponse = Record<string, any>,
    TContext = Context,
  >(): TransportRequestPromise<ApiResponse<TResponse, TContext>>

  /**
   * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/introduction.html
   */
  esSearch<
    TResponse = Record<string, any>,
    TRequestBody extends RequestBody = Record<string, any>,
    TContext = Context,
  >(
    params?: TRequestBody,
    options?: ESSearchOptions,
  ): TransportRequestPromise<ApiResponse<TResponse, TContext> | any>

  esSynchronize<TResponse = Record<string, any>, TContext = Context>(
    filter?:
      | FilterQuery<TSchema>
      | QueryWithHelpers<
          Array<EnforceDocument<TSchema, TMethods>>,
          EnforceDocument<TSchema, TMethods>,
          TQueryHelpers,
          TSchema
        >,
    projection?: any | null,
    options?: QueryOptions | null,
  ): TransportRequestPromise<ApiResponse<TResponse, TContext>>

  esCount<
    TResponse = Record<string, any>,
    TRequestBody extends RequestBody = Record<string, any>,
    TContext = Context,
  >(
    query?: TRequestBody | string,
    options?: { countOnly?: boolean },
  ): TransportRequestPromise<ApiResponse<TResponse, TContext> | number>

  esExists(): Promise<boolean>

  esDeleteIndex<
    TResponse = Record<string, any>,
    TContext = Context,
  >(): TransportRequestPromise<ApiResponse<TResponse, TContext>>
}

export interface ElasticsearchMethods {
  esOptions?(): PluginOptions

  esIndex?<TResponse = Record<string, any>, TContext = Context>(
    updater?: Updater,
  ): TransportRequestPromise<ApiResponse<TResponse, TContext>>

  esUnset<TResponse = Record<string, any>, TContext = Context>(
    fields?: string[],
  ): TransportRequestPromise<ApiResponse<TResponse, TContext>>

  esRemove<
    TResponse = Record<string, any>,
    TContext = Context,
  >(): TransportRequestPromise<ApiResponse<TResponse, TContext>>
}

export function ElasticsearchPlugin(schema, options) {
  if (!options.client) return

  options = clone(options)

  schema.__ELASTIC = true

  schema.statics.esOptions = esOptions(options)
  schema.statics.esCreateMapping = esCreateMapping
  schema.statics.esRefresh = esRefresh
  schema.statics.esSearch = esSearch
  schema.statics.esSynchronize = esSynchronize
  schema.statics.esCount = esCount
  schema.statics.esExists = esExists
  schema.statics.esDeleteIndex = esDeleteIndex

  schema.methods.esOptions = esOptions(options)
  schema.methods.esIndex = esIndex
  schema.methods.esUnset = unsetFields
  schema.methods.esRemove = esRemove

  if (!options.esManualIndexing) {
    schema.pre('save', preSave)
    schema.post('save', postSave)
    schema.post('findOneAndUpdate', postSave)
    schema.post('remove', postRemove)
    schema.post('findOneAndRemove', postRemove)
  }
}
