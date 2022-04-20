import mongoose, { Schema } from 'mongoose'
import { Mongoosearch } from '../../../src'
import { ElasticsearchClient } from '../elasticsearch-client'
import { MongoosearchModel } from '../../../src/mongoosearch-model'
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
