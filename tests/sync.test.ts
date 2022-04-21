import { expect } from 'chai'
import { SnakeCollection } from './utils/collections/snake-collection'
import faker from 'faker'
import { clearIndexes } from './utils/clear-indexes'
import { ElasticsearchClient } from './utils/elasticsearch-client'

describe('Synchronization', () => {
  beforeEach(async () => {
    await SnakeCollection.deleteMany({})
    await clearIndexes()

    await SnakeCollection.esCreateMapping()
  })

  afterEach(async () => {
    await SnakeCollection.deleteMany({})
    await clearIndexes()
  })

  it('should do a partial sync', async () => {
    await SnakeCollection.create({ sample: 'Bogus' })
    await SnakeCollection.create({ sample: 'Sample' })

    await SnakeCollection.esSync({ sample: /sample/i })

    const result = await SnakeCollection.esSearch(
      {
        query: {
          match_all: {},
        },
      },
      { hydrate: { docsOnly: true } },
    )

    expect(result).to.have.length.greaterThan(0)

    expect(result.map(({ sample }) => /sample/i.test(sample)).every(Boolean)).to
      .be.true
  })

  it('should sync a large dataset successfully', async () => {
    const snakeDataset = [...new Array(1000)].map(() => faker.animal.snake())

    for (const snake of snakeDataset) {
      await SnakeCollection.create({ sample: snake })
    }

    const result = await SnakeCollection.esSync()

    expect(result)
      .to.have.property('_shards')
      .that.has.property('successful')
      .that.is.greaterThan(0)

    const docs = await ElasticsearchClient.search({
      index: 'test_snakes',
      query: {
        match_all: {},
      },
    })

    expect(docs).to.containSubset({
      hits: {
        total: { value: snakeDataset.length },
      },
    })
  })
})
