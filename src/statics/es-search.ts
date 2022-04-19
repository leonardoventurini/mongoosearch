import * as utils from '../utils'
import mongoose from 'mongoose'
import { isString } from 'lodash'

export type ESSearchOptions = {
  idsOnly?: boolean
  hydrate?: {
    select?: string
    options?: any
    docsOnly?: boolean
    populate?: any
  }
}

export async function esSearch(query: any = {}, options: ESSearchOptions = {}) {
  const esOptions = this.esOptions()

  const hydrate =
    options.hydrate === false ? false : options.hydrate || esOptions.hydrate
  const idsOnly =
    options.idsOnly === false ? false : options.idsOnly || esOptions.idsOnly

  const params: any = {
    index: esOptions.index,
    type: esOptions.type,
  }

  if (isString(query)) {
    params.q = query
  } else {
    params.body = query.query ? query : { query }
  }

  if (hydrate) {
    params._source = false
  }

  let { body: result } = await esOptions.client.search(params)

  if (!hydrate && !idsOnly) {
    return result
  }

  const isObjectId = utils.getType(this.schema.paths._id) === 'objectid'

  const ids = result.hits.hits.map(hit =>
    isObjectId ? mongoose.Types.ObjectId(hit._id) : hit._id,
  )

  if (idsOnly) {
    return ids
  }

  const {
    select = undefined,
    opts = undefined,
    docsOnly = false,
  } = hydrate ?? {}

  if (!result.hits.total) {
    return docsOnly ? [] : result
  }

  let query$ = this.find({ _id: { $in: ids } }, select, opts)

  if (hydrate.populate) {
    query$ = query$.populate(hydrate.populate)
  }

  const docs = await query$

  const docsById = new Map()

  docs.forEach(doc => {
    docsById.set(doc._id, doc)
  })

  if (docsOnly) {
    result = Array.from(docsById.values())
  } else {
    result.hits.hits.forEach(hit => {
      hit.doc = docsById.get(hit._id)
    })
  }

  return result
}
