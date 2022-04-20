import { MongoosearchMethods } from '../mongoosearch-methods'
import { Document } from 'mongoose'

export async function esRemove(this: MongoosearchMethods & Document) {
  const esOptions = this.esOptions()

  return esOptions.client.delete({
    index: esOptions.index,
    id: this._id.toString(),
  })
}
