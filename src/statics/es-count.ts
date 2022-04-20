import { isEmpty, isString } from 'lodash'
import { MongoosearchMethods } from '../mongoosearch-methods'

export async function esCount(
  this: MongoosearchMethods,
  query: Record<string, any> | string = null,
  options: { countOnly?: boolean } = {},
) {
  const self = this

  const esOptions = self.esOptions()

  const countOnly = options?.countOnly ?? esOptions.countOnly ?? false

  const params: any = {
    index: esOptions.index,
  }

  if (!isEmpty(query)) {
    if (isString(query)) {
      params.q = query
    } else {
      params.body = query.query ? query : { query }
    }
  }

  const result = await esOptions.client.count(params)

  return countOnly ? result?.count : result
}
