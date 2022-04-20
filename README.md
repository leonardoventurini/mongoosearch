# Mongoosearch <sup>Beta</sup>

Integrate Mongoose with Elasticsearch, the easy way.

## Installation

This module is distributed via [npm](https://www.npmjs.com/), commands:

```shell
npm install mongoosearch
```

or:

```shell
yarn add mongoosearch
```

## Initializing

```ts
import mongoose, { Schema } from 'mongoose'
import { Mongoosearch, MongoosearchModel } from 'mongoosearch'
import { ElasticsearchClient } from '../elasticsearch-client'
import { CollectionNames } from '../collection-names'

export interface Cat extends Document {
  sample: string
}

export interface CatModel extends MongoosearchModel<Cat> {}

export const CatSchema = new Schema<Cat, CatModel>({
  sample: { type: String, elasticsearch: true },
}).plugin(Mongoosearch, { client: ElasticsearchClient })

export const CatCollection = mongoose.model<Cat, CatModel>(
  CollectionNames.Cat,
  CatSchema,
)
```

Then:

```ts
await CatCollection.esCreateMapping()
```

This will parse the schema fields containing Elasticsearch enabled fields and persist the corresponding mapping.

Now new documents will be automatically persisted on Elasticsearch.

If you specify the `manual` option like so:

```ts
schema.plugin(Mongoosearch, { client: ElasticsearchClient, manual: true })
```

Then you will need to call `esSync` manually:

```ts
await CatCollection.esSync()
```

## Searching

After you got your collection indexed you can search it:

```ts
const results = await CatCollection.esSearch({
  query_string: { query: 'garfield' },
})
```
