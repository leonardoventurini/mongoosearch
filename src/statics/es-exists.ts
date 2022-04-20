import { esLog } from '../utils'
import chalk from 'chalk'

export async function esExists() {
  const { client, index } = this.esOptions()

  try {
    const result = await client.indices.exists({
      index,
    })

    esLog(
      `index ${chalk.cyan(index)}`,
      result ? chalk.green`exists` : chalk.red`does not exist`,
    )

    return result
  } catch (error) {
    return false
  }
}
