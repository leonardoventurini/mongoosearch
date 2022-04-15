import { isEmpty, isString } from 'lodash'
import { ElasticsearchMethods } from '../elasticsearch-plugin'

export async function esCount(
  this: ElasticsearchMethods,
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

  return countOnly ? result?.data?.count : result
}
