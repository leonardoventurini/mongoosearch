import { Document } from 'mongoose'
import * as utils from './utils'
import { clone } from 'lodash'
import { esIndex, esOptions } from './methods'
import { esCreateMapping } from './statics/es-create-mapping'
import { esExists } from './statics/es-exists'
import { esDeleteIndex } from './statics/es-delete-index'
import { esCount } from './statics/es-count'
import { esSynchronize } from './statics/es-synchronize'
import { esSearch } from './statics/es-search'
import { esRefresh } from './statics/es-refresh'
import { ElasticsearchMethods } from './elasticsearch-methods'

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
