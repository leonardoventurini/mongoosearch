import { BaseIngredients } from '../base-data/base-ingredients'
import { Collections } from '../collections'
import { expect } from 'chai'
import { ElasticsearchClient } from '../elasticsearch-client'
import { Client } from '@elastic/elasticsearch'
import { ESType } from '../src/mapping'
import { omit } from 'lodash'
import { TestDatabase } from "../test-database";

async function clearIndexes() {
  const getIndexes = await ElasticsearchClient.indices.get({ index: 'test_*' })

  for (const index of Object.keys(getIndexes.data)) {
    console.log(`Deleting index ${index}`)

    await ElasticsearchClient.indices.delete({
      index,
    })
  }
}

describe('Elasticsearch Plugin', async () => {
  let organization

  before(async () => {
    await clearIndexes()

    await Collections.Ingredients.deleteMany({})

    organization = await Collections.Organizations.create({
      name: 'Test Organization',
      legalName: 'TEST ORGANIZATION LDTA',
      cnpj: '15.586.422/0001-68',
      slug: 'test-organization',
    })

    await Collections.Ingredients.esCreateMapping()

    for (const ingredient of BaseIngredients) {
      await Collections.Ingredients.create({
        ...ingredient,
        organization,
      })
    }

    await Collections.Ingredients.esSynchronize()
  })

  after(async () => {
    await Collections.Ingredients.deleteMany({})

    await clearIndexes()
  })

  it('should check if the index exists', async () => {
    expect(await Collections.Ingredients.esExists()).to.be.true
    expect(await Collections.Recipes.esExists()).to.be.false
  })

  it('should delete then recreate index', async () => {
    await Collections.Recipes.esCreateMapping()

    await Collections.Recipes.esDeleteIndex()
    expect(await Collections.Recipes.esExists()).to.be.false

    await Collections.Recipes.esCreateMapping()
    expect(await Collections.Recipes.esExists()).to.be.true
  })

  it('should store documents into index', async () => {
    const indices = await ElasticsearchClient.cat.indices({ format: 'json' })

    expect(indices).to.containSubset({
      data: [
        {
          index: 'test_ingredients',
        },
      ],
    })

    const result = await Collections.Ingredients.esSearch({
      query_string: { query: 'farinha' },
    })

    expect(result).to.containSubset({
      hits: {
        hits: [
          {
            _index: 'test_ingredients',
          },
        ],
      },
    })
  })

  it('should return the count with no params', async () => {
    const res = await Collections.Ingredients.esCount()

    expect(res).to.containSubset({
      data: {
        count: 23,
      },
    })
  })

  it('should return the count only', async () => {
    const count = await Collections.Ingredients.esCount(null, {
      countOnly: true,
    })

    expect(count).to.equal(23)
  })

  it('should return the count for a query string', async () => {
    const res = await Collections.Ingredients.esCount('farinha', {
      countOnly: true,
    })

    expect(res).to.equal(1)
  })

  it('should get elasticsearch plugin options for collection', async () => {
    const options = Collections.Ingredients.esOptions()

    expect(options.client).to.be.instanceOf(Client)

    expect(omit(options, 'client')).to.containSubset({
      esManualIndexing: true,
      index: 'test_ingredients',
      mapping: {
        properties: {
          number: { type: ESType.Long },
          organization: { type: ESType.Keyword },
          name: { type: ESType.Text },
          identifier: { type: ESType.Text },
          description: { type: ESType.Text },
          nameLength: { type: ESType.Integer }, // Extend Option
        },
      },
    })
  })

  it('should ignore diacritics by using the folding analyzer', async () => {
    const data = await Collections.Ingredients.esSearch({
      query_string: { query: 'cafe' },
    })

    expect(data.hits.hits).to.have.length(2)
  })

  describe('Synchronization', () => {
    afterEach(async () => {
      await TestDatabase.clearDatabase()
    })

    it('should synchronize', async () => {
      await BaseData.generate()

      const { data } = await Collections.Ingredients.esSynchronize()

      expect(data?._shards?.successful).to.be.greaterThan(0)
    })

    it('should search', async () => {
      await clearIndexes()

      await BaseData.generate()

      await Collections.Ingredients.esSynchronize({ name: /salsicha/i })

      const result = await Collections.Ingredients.esSearch({
        query: {
          match_all: {},
        },
      })

      const { hits } = result?.hits ?? {}

      expect(hits).to.have.length.greaterThan(0)

      expect(
        hits
          .map(({ _source }) => /salsicha/i.test(_source.name))
          .every(Boolean),
      ).to.be.true
    })
  })
})
