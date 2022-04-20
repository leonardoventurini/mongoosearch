import { MongoosearchMethods } from '../mongoosearch-methods'

export async function esRefresh(this: MongoosearchMethods) {
  const options = this.esOptions()

  return options.client.indices.refresh({
    index: options.index,
  })
}
