import {
  EnforceDocument,
  FilterQuery,
  Model,
  QueryOptions,
  QueryWithHelpers,
} from 'mongoose'
import { CreateMappingOptions } from './statics/es-create-mapping'
import {
  ApiResponse,
  Context,
  RequestBody,
  TransportRequestPromise,
} from '@elastic/elasticsearch/lib/Transport'
import * as T from '@elastic/elasticsearch/api/types'
import { ESSearchOptions } from './statics/es-search'
import { PluginOptions } from './plugin-options'

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
