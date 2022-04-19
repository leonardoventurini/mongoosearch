import { ElasticsearchMethods } from '../elasticsearch-methods'

export async function esRefresh(this: ElasticsearchMethods) {
  const options = this.esOptions()

  return options.client.indices.refresh({
    index: options.index,
  })
}
