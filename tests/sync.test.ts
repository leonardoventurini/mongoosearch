import { expect } from 'chai'
import { TestDatabase } from './utils/test-database'
import { SnakeCollection } from './utils/collections/snake-collection'
import faker from 'faker'
import { clearIndexes } from './utils/clear-indexes'

const firstSnake = faker.animal.snake()

describe('Synchronization', () => {
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

  afterEach(async () => {
    await TestDatabase.clearDatabase()
  })

  it('should synchronize', async () => {
    const result = await SnakeCollection.esSync()

    // @ts-ignore
    expect(result?._shards?.successful).to.be.greaterThan(0)
  })

  it('should search', async () => {
    await clearIndexes()

    await SnakeCollection.create({ sample: 'Sample 2' })

    await SnakeCollection.esSync({ sample: /sample/i })

    const result = await SnakeCollection.esSearch({
      query: {
        match_all: {},
      },
    })

    const { hits } = result?.hits ?? {}

    expect(hits).to.have.length.greaterThan(0)

    expect(
      hits.map(({ _source }) => /sample/i.test(_source.sample)).every(Boolean),
    ).to.be.true
  })
})
