import { cloneDeep } from 'lodash'
import { esIndex, esOptions } from './methods'
import { esCreateMapping } from './statics/es-create-mapping'
import { esExists } from './statics/es-exists'
import { esDeleteIndex } from './statics/es-delete-index'
import { esCount } from './statics/es-count'
import { esSync } from './statics/es-sync'
import { esSearch } from './statics/es-search'
import { esRefresh } from './statics/es-refresh'
import { esUnset } from './statics/es-unset'
import { esRemove } from './statics/es-remove'
import { postRemove } from './hooks/post-remove'
import { postSave } from './hooks/post-save'
import { preSave } from './hooks/pre-save'

export function Mongoosearch(schema, options) {
  if (!options.client) return

  options = cloneDeep(options)

  schema.__ELASTIC = true

  schema.statics.esCount = esCount
  schema.statics.esCreateMapping = esCreateMapping
  schema.statics.esDeleteIndex = esDeleteIndex
  schema.statics.esExists = esExists
  schema.statics.esOptions = esOptions(options)
  schema.statics.esRefresh = esRefresh
  schema.statics.esSearch = esSearch
  schema.statics.esSync = esSync

  schema.methods.esIndex = esIndex
  schema.methods.esOptions = esOptions(options)
  schema.methods.esRemove = esRemove
  schema.methods.esUnset = esUnset

  if (!options.esManualIndexing) {
    schema.pre('save', preSave)
    schema.post('save', postSave)
    schema.post('findOneAndUpdate', postSave)
    schema.post('remove', postRemove)
    schema.post('findOneAndRemove', postRemove)
  }
}
