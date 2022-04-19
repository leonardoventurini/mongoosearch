import {
  ApiResponse,
  Context,
  TransportRequestPromise,
} from '@elastic/elasticsearch/lib/Transport'
import { Updater } from './methods'
import { PluginOptions } from './plugin-options'

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
