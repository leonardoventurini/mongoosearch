import { Client } from '@elastic/elasticsearch'
import { Document } from 'mongoose'
import { BulkOptions } from './bulk-options'

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
