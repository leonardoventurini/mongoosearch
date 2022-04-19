import { Client } from '@elastic/elasticsearch'

export const ElasticsearchClient = new Client({
  node: 'http://localhost:9200',
  requestTimeout: 5000,
})
