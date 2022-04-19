import { clone } from 'lodash'
import { esIndex, esOptions } from './methods'
import { esCreateMapping } from './statics/es-create-mapping'
import { esExists } from './statics/es-exists'
import { esDeleteIndex } from './statics/es-delete-index'
import { esCount } from './statics/es-count'
import { esSynchronize } from './statics/es-synchronize'
import { esSearch } from './statics/es-search'
import { esRefresh } from './statics/es-refresh'
import { esUnset } from './es-unset'
import { esRemove } from './statics/es-remove'
import { postRemove } from './hooks/post-remove'
import { postSave } from './hooks/post-save'
import { preSave } from './hooks/pre-save'

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
  schema.methods.esUnset = esUnset
  schema.methods.esRemove = esRemove

  if (!options.esManualIndexing) {
    schema.pre('save', preSave)
    schema.post('save', postSave)
    schema.post('findOneAndUpdate', postSave)
    schema.post('remove', postRemove)
    schema.post('findOneAndRemove', postRemove)
  }
}
