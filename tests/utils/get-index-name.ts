import { lowerCase } from 'lodash'

export function getIndexName(collectionName: string) {
  return `test_${lowerCase(collectionName)}s`
}
