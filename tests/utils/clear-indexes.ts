import { ElasticsearchClient } from './elasticsearch-client'
import { esLog } from '../../src'
import chalk from 'chalk'

export async function clearIndexes() {
  const indexes = await ElasticsearchClient.indices.get({ index: 'test_*' })

  for (const index of Object.keys(indexes)) {
    esLog(chalk.red`deleting index ${chalk.cyan(index)}`)

    await ElasticsearchClient.indices.delete({
      index,
    })
  }
}
