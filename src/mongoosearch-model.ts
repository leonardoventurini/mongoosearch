import {
  EnforceDocument,
  FilterQuery,
  Model,
  QueryOptions,
  QueryWithHelpers,
} from 'mongoose'
import {
  CreateMappingOptions,
  esCreateMapping,
} from './statics/es-create-mapping'

import { esSearch, ESSearchOptions } from './statics/es-search'
import { PluginOptions } from './plugin-options'
import { Context } from 'mocha'
import { esRefresh } from './statics/es-refresh'
import { RequestBody } from '@elastic/elasticsearch'
import { esSync } from './statics/es-sync'
import { esCount } from './statics/es-count'
import { esDeleteIndex } from './statics/es-delete-index'

export interface MongoosearchModel<
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
  ): ReturnType<typeof esCreateMapping>

  esRefresh<TResponse = Record<string, any>, TContext = Context>(): ReturnType<
    typeof esRefresh
  >

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
  ): ReturnType<typeof esSearch>

  esSync<TResponse = Record<string, any>, TContext = Context>(
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
  ): ReturnType<typeof esSync>

  esCount<
    TResponse = Record<string, any>,
    TRequestBody extends RequestBody = Record<string, any>,
    TContext = Context,
  >(
    query?: TRequestBody | string,
    options?: { countOnly?: boolean },
  ): ReturnType<typeof esCount>

  esExists(): Promise<boolean>

  esDeleteIndex<
    TResponse = Record<string, any>,
    TContext = Context,
  >(): ReturnType<typeof esDeleteIndex>
}
