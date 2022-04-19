import mongoose, { Schema } from 'mongoose'
import { ElasticsearchPlugin } from '../../src/elasticsearch-plugin'
import { ElasticsearchClient } from './elasticsearch-client'
import { ElasticsearchModel } from '../../src/elasticsearch-model'
import { CollectionNames } from './collection-names'

export interface Snake extends Document {
  sample: string
}

export interface SnakeModel extends ElasticsearchModel<Snake> {}

export const SnakeSchema = new Schema<Snake, SnakeModel>({
  sample: { type: String, elasticsearch: true },
}).plugin(ElasticsearchPlugin, {
  client: ElasticsearchClient,
  esManualIndexing: true,
})

export const SnakeCollection = mongoose.model<Snake, SnakeModel>(
  CollectionNames.Snake,
  SnakeSchema,
)
