import { esIndex, Updater } from './methods'
import { PluginOptions } from './plugin-options'
import { esUnset } from './es-unset'
import { esRemove } from './statics/es-remove'

export interface MongoosearchMethods {
  esOptions(): PluginOptions

  esIndex(updater?: Updater): ReturnType<typeof esIndex>

  esUnset(fields?: string[]): ReturnType<typeof esUnset>

  esRemove(): ReturnType<typeof esRemove>
}
