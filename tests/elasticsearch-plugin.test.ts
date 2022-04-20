import { expect } from 'chai'
import { Client } from '@elastic/elasticsearch'
import { lowerCase, omit } from 'lodash'
import { ElasticsearchClient } from './utils/elasticsearch-client'
import { SnakeCollection } from './utils/collections/snake-collection'
import faker from 'faker'
import { getIndexName } from './utils/get-index-name'
import { CollectionNames } from './utils/collection-names'
import { CatCollection } from './utils/collections/cat-collection'
import { ESType } from '../src'
import { clearIndexes } from './utils/clear-indexes'

const firstSnake = faker.animal.snake()

describe('Elasticsearch Plugin', async () => {
  beforeEach(async () => {
    await clearIndexes()
    await SnakeCollection.deleteMany({})

    await SnakeCollection.create({
      sample: firstSnake,
    })

    await SnakeCollection.esCreateMapping()
    await SnakeCollection.esSync()
  })

  afterEach(async () => {
    await SnakeCollection.deleteMany({})
    await clearIndexes()
  })

  it('should check if the index exists', async () => {
    expect(await SnakeCollection.esExists()).to.be.true
    expect(await CatCollection.esExists()).to.be.false
  })

  /**
   * @unstable
   */
  it('should delete then recreate index', async () => {
    await SnakeCollection.esDeleteIndex()
    expect(await SnakeCollection.esExists()).to.be.false

    await SnakeCollection.esCreateMapping()
    expect(await SnakeCollection.esExists()).to.be.true
  })

  it('should store documents into index', async () => {
    const indices = await ElasticsearchClient.cat.indices({ format: 'json' })

    expect(indices).to.containSubset([
      {
        index: getIndexName(CollectionNames.Snake),
      },
    ])

    const result = await SnakeCollection.esSearch({
      query_string: { query: lowerCase(firstSnake) },
    })

    expect(result).to.containSubset({
      hits: {
        hits: [
          {
            _index: getIndexName(CollectionNames.Snake),
          },
        ],
      },
    })
  })

  it('should return the count with no params', async () => {
    const res = await SnakeCollection.esCount()

    expect(res).to.containSubset({
      count: 1,
    })
  })

  it('should return the count only', async () => {
    const count = await SnakeCollection.esCount(null, {
      countOnly: true,
    })

    expect(count).to.equal(1)
  })

  it('should return the count for a query string', async () => {
    const res = await SnakeCollection.esCount(lowerCase(firstSnake), {
      countOnly: true,
    })

    expect(res).to.equal(1)
  })

  it('should get elasticsearch plugin options for collection', async () => {
    const options = SnakeCollection.esOptions()

    expect(options.client).to.be.instanceOf(Client)

    expect(omit(options, 'client')).to.containSubset({
      esManualIndexing: true,
      index: getIndexName(CollectionNames.Snake),
      mapping: {
        properties: {
          sample: { type: ESType.Text },
        },
      },
    })
  })

  it('should ignore diacritics by using the folding analyzer', async () => {
    await SnakeCollection.create({ sample: 'With Ãccént' })

    await SnakeCollection.esSync()

    const data = await SnakeCollection.esSearch({
      query_string: { query: 'with accent' },
    })

    expect(data.hits.hits).to.have.length(1)
  })
})
