import { merge } from 'lodash'
import chalk from 'chalk'
import { esLog } from '../utils'

export type CreateMappingOptions = {
  delete?: boolean
}

export async function esCreateMapping(opts?: CreateMappingOptions) {
  const { index, mappingSettings, mapping, client } = this.esOptions()

  if (await this.esExists()) {
    if (opts?.delete) {
      esLog(`deleting map for ${chalk.cyan(index)}`)
      await this.esDeleteIndex()
    } else {
      return client.indices.putMapping({
        index,
        body: mapping,
      })
    }
  }

  if (await this.esExists()) return

  esLog(`creating map for ${chalk.cyan(index)}`)

  return await client.indices.create({
    index,
    body: merge(
      {
        settings: {
          analysis: {
            analyzer: {
              folding: {
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
          // number_of_shards: 5,
        },
        mappings: {
          ...mapping,
        },
      },
      mappingSettings,
    ),
  })
}
