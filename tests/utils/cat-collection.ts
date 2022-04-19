import mongoose, { Schema } from 'mongoose'
import { ElasticsearchPlugin } from '../../src/elasticsearch-plugin'
import { ElasticsearchClient } from './elasticsearch-client'
import { ElasticsearchModel } from '../../src/elasticsearch-model'
import { CollectionNames } from './collection-names'

export interface Cat extends Document {
  sample: string
}

export interface CatModel extends ElasticsearchModel<Cat> {}

export const CatSchema = new Schema<Cat, CatModel>({
  sample: { type: String, elasticsearch: true },
}).plugin(ElasticsearchPlugin, { client: ElasticsearchClient })

export const CatCollection = mongoose.model<Cat, CatModel>(
  CollectionNames.Cat,
  CatSchema,
)
