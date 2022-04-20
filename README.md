# Mongoosearch <sup>Beta</sup>

Integrate Mongoose with Elasticsearch, the easy way.

## Installation

```shell
npm install mongoosearch
```

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
