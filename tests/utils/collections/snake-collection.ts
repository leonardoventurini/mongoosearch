import mongoose, { Schema } from 'mongoose'
import { Mongoosearch } from '../../../src/mongoosearch'
import { ElasticsearchClient } from '../elasticsearch-client'
import { MongoosearchModel } from '../../../src/mongoosearch-model'
import { CollectionNames } from '../collection-names'

export interface Snake extends Document {
  sample: string
}

export interface SnakeModel extends MongoosearchModel<Snake> {}

export const SnakeSchema = new Schema<Snake, SnakeModel>({
  sample: { type: String, elasticsearch: true },
}).plugin(Mongoosearch, {
  client: ElasticsearchClient,
  manual: true,
})

export const SnakeCollection = mongoose.model<Snake, SnakeModel>(
  CollectionNames.Snake,
  SnakeSchema,
)
