import { ElasticsearchMethods } from '../elasticsearch-methods'
import { Document } from 'mongoose'

export async function esRemove(this: ElasticsearchMethods & Document) {
  const esOptions = this.esOptions()

  return esOptions.client.delete({
    index: esOptions.index,
    id: this._id.toString(),
  })
}
