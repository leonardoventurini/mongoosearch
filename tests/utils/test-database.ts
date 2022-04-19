import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

export namespace TestDatabase {
  let mongod = null

  export const connect = async () => {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
  }

  export const clearDatabase = async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async collection => {
        await collection.deleteMany({})
      }),
    )
  }

  export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
  }

  export const mochaSetup = () => {
    before(async () => {
      console.log('Setting Up Memory MongoDB...')
      await connect()
    })

    after(async () => {
      await clearDatabase()

      /**
       * We need to clear the schemas and models otherwise Mocha will try to
       * overwrite them since the same instance is utilized.
       */
      mongoose.connection.models = {}

      // @ts-ignore
      mongoose.models = {}

      // @ts-ignore
      mongoose.modelSchemas = {}

      console.log('Closing Memory MongoDB...')

      await closeDatabase()
    })
  }
}
