import { ElasticsearchClient } from './elasticsearch-client'

export async function clearIndexes() {
  const indexes = await ElasticsearchClient.indices.get({ index: 'test_*' })

  console.log({ indexes })

  for (const index of Object.keys(indexes)) {
    console.log(`Deleting index ${index}`)

    await ElasticsearchClient.indices.delete({
      index,
    })
  }
}
