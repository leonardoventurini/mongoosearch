import { getExtraOptions, getType } from './utils'
import { get, isFunction, isObject, set } from 'lodash'
import { ESType } from './es-type'

export type ESMapping = Record<string, { type: ESType; properties?: ESMapping }>
export type ESTypeOption = ESType | Record<string, { type: ESTypeOption }>

declare module 'mongoose' {
  export interface SchemaTypeOptions<T> {
    elasticsearch?: {
      indexed?: boolean
      type?: ESTypeOption
      value?(doc: Document): any
    } & Record<string, any>
  }

  export interface SchemaOptions {
    elasticsearch?: {
      typeKey?: string
      extend?: Record<
        string,
        {
          type?: ESType
          value?(doc: Document): any
        }
      >
    } & Record<string, any>
  }
}

export function generate(schema: any) {
  const mapping = {} as any
  const typeKey = getTypeKey(schema)

  const explicit = hasExplicit(schema, typeKey)

  const defaultTypes = {
    objectid: ESType.Keyword,
    number: ESType.Long,
    mixed: ESType.Object,
    string: ESType.Text,
  }

  Object.keys(schema.paths).forEach(name => {
    if (name === '_id') {
      return
    }

    const path = schema.paths[name]
    const type = getType(path)
    const options = getOptions(path, typeKey)

    if (
      explicit &&
      isEmbedded(type) &&
      !get(options, 'elasticsearch.indexed')
    ) {
      set(options, 'elasticsearch.indexed', hasExplicit(path.schema, typeKey))
    }

    if (explicit && !options.elasticsearch?.indexed) {
      return
    }

    let current = mapping

    const names = name.split('.')

    // handle plain object
    if (names.length > 1) {
      names.forEach((name, index) => {
        if (index === names.length - 1) {
          // last item is the target
          current = current[name] = { type, ...getExtraOptions(options) }
        } else {
          if (!current[name]) {
            current[name] = { type: 'object', properties: {} }
          }
          current = current[name].properties
        }
      })
    } else {
      current = mapping[name] = { type, ...getExtraOptions(options) }
    }

    if (options.elasticsearch?.type && isObject(options.elasticsearch.type)) {
      current.type = 'object'
      current.properties = generateESTypeMapping(options.elasticsearch.type)
    } else {
      if (
        !get(options, 'elasticsearch.value') ||
        !options.elasticsearch?.type
      ) {
        if (isEmbedded(type)) {
          current.type = 'object'
          current.properties = generate(path.schema)
        }
        if (defaultTypes[type]) {
          current.type = defaultTypes[type]
        }
      }
    }

    if (get(options, 'elasticsearch.value')) {
      current.value = isFunction(options.elasticsearch.value)
        ? options.elasticsearch.value
        : function () {
            return options.elasticsearch.value
          }
    }
  })

  delete mapping[schema.get('versionKey')]

  if (schema.options && schema.options.elasticsearch?.extend) {
    Object.assign(
      mapping,
      generateESTypeMapping(schema.options.elasticsearch.extend, true),
    )
  }

  return mapping
}

function isEmbedded(type) {
  return type === 'embedded' || type === 'array'
}

function getTypeKey(schema) {
  return schema.options.elasticsearch?.typeKey ?? 'type'
}

function hasExplicit(schema, typeKey) {
  return schema && schema.paths
    ? Object.keys(schema.paths).some(name => {
        if (name === '_id') {
          return
        }

        const path = schema.paths[name]

        const type = getType(path)

        if (isEmbedded(type)) {
          if (hasExplicit(path.schema, getTypeKey(path.schema))) {
            return true
          }
        }

        return get(getOptions(path, typeKey), 'elasticsearch.indexed')
      })
    : false
}

function getOptions(path, typeKey) {
  if (
    Array.isArray(path.options[typeKey]) &&
    path.options[typeKey].length === 1 &&
    path.options[typeKey][0].ref
  ) {
    return path.options[typeKey][0]
  }
  return path.options
}

function generateESTypeMapping(content, esExtendMode?) {
  const properties = {}

  Object.keys(content).forEach(key => {
    if (content[key] && isObject(content[key])) {
      properties[key] = {}

      if (
        content[key].elasticsearch?.type &&
        isObject(content[key].elasticsearch?.type)
      ) {
        properties[key].type = 'object'
        properties[key].properties = generateESTypeMapping(
          content[key].elasticsearch.type,
          esExtendMode,
        )
      } else {
        Object.keys(content[key]).forEach(subKey => {
          let value = content[key][subKey]
          const original = value

          if (subKey === 'value' && esExtendMode) {
            value = function (_, context) {
              return isFunction(original)
                ? original(context.document)
                : original
            }
          }

          properties[key][subKey] = value
        })
      }
    }
  })

  return properties
}
