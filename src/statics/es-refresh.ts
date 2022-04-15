import { ElasticsearchMethods } from '../elasticsearch-plugin'

export async function esRefresh(this: ElasticsearchMethods) {
  const options = this.esOptions()

  return options.client.indices.refresh({
    index: options.index,
  })
}
