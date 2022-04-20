import { isFunction, omit } from 'lodash'
import mongoose from 'mongoose'
import chalk from 'chalk'

export function getUndefineds(document, mapping) {
  let field
  const result = []
  for (field in mapping.properties) {
    if ({}.hasOwnProperty.call(mapping.properties, field)) {
      if (document[field] === undefined && document.isModified(field)) {
        result.push(field)
      }
    }
  }
  return result
}

export function serialize(document, mapping, main?) {
  let name

  main = main ?? document

  function _serializeObject(object, mappingData) {
    const serialized = {}
    Object.keys(mappingData.properties).forEach(field => {
      let value
      const property = mappingData.properties[field]
      try {
        if ({}.hasOwnProperty.call(property, 'value')) {
          value = isFunction(property.value)
            ? property.value(object[field], {
                document: main,
                container: object,
                field,
              })
            : property.value
        } else if (object[field] !== undefined) {
          value = serialize.call(object, object[field], property, main)
        }
        if (value !== undefined) {
          serialized[field] = value
        }
      } catch (err) {
        // do nothing
      }
    })
    if (
      !Object.keys(serialized).length &&
      (typeof object !== 'object' || object instanceof mongoose.Types.ObjectId)
    ) {
      return
    }
    return serialized
  }

  if (mapping.properties && document) {
    if (Array.isArray(document)) {
      return document.map(object => _serializeObject(object, mapping))
    }
    return _serializeObject(document, mapping)
  }

  if (document && typeof document === 'object') {
    name = document.constructor.name
    if (name === 'model') {
      return document.id
    }

    if (name === 'ObjectID') {
      return document.toString()
    }

    if (name === 'Date') {
      return new Date(document).toJSON()
    }
  }

  return document
}

export function getType(path) {
  return (path.caster?.instance ?? path.instance).toLowerCase()
}

export function getExtraOptions(options) {
  return omit(options.elasticsearch, 'indexed', 'type', 'value')
}

export const isTest = process.env.NODE_ENV === 'test'

export function esLog(...args) {
  if (isTest) {
    console.log(chalk.yellow(...args))
  }
}
