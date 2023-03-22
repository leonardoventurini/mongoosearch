import { ESType } from './es-type'
import { ESTypeOption } from './mapping'

declare module 'mongoose' {
  export interface SchemaTypeOptions<T> {
    elasticsearch?:
      | ({
          indexed?: boolean
          type?: ESTypeOption
          value?(doc: Document): any
        } & Record<string, any>)
      | boolean
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

export * from './es-type'
export * from './mongoosearch'
export * from './mongoosearch-methods'
export * from './mongoosearch-model'
export * from './plugin-options'
export * from './utils'
