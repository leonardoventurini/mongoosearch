import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'
import { TestDatabase } from './test-database'

chai.use(chaiAsPromised)
chai.use(sinonChai)
chai.use(chaiSubset)

TestDatabase.mochaSetup()
