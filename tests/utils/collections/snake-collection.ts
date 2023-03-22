import mongoose, { Schema } from 'mongoose'
import { ESType, Mongoosearch, MongoosearchModel } from '../../../src'
import { ElasticsearchClient } from '../elasticsearch-client'
import { CollectionNames } from '../collection-names'

export interface Snake extends Document {
  sample: string

  embeddings: number[]
}

export interface SnakeModel extends MongoosearchModel<Snake> {}

export const SnakeSchema = new Schema<Snake, SnakeModel>({
  sample: { type: String, elasticsearch: true },
  embeddings: {
    type: [Number],
    default: Array(768).fill(0),
    elasticsearch: {
      type: ESType.DenseVector,
      dims: 768,
    },
  },
}).plugin(Mongoosearch, {
  client: ElasticsearchClient,
  manual: true,
})

export const SnakeCollection = mongoose.model<Snake, SnakeModel>(
  CollectionNames.Snake,
  SnakeSchema,
)
