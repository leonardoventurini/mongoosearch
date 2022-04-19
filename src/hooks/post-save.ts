export async function postSave(doc) {
  if (doc && doc.esOptions) {
    const data = doc._mexp || {}
    const esOptions = doc.esOptions()

    delete doc._mexp

    if (!esOptions.filter || esOptions.filter(doc)) {
      try {
        let res = await doc.esIndex(data.wasNew ? false : { unset: data.unset })

        res =
          esOptions.script && data.unset?.length ? doc.esUnset(data.unset) : res

        doc.emit('es-indexed', undefined, res)
        doc.constructor.emit('es-indexed', undefined, res)
      } catch (err) {
        doc.emit('es-indexed', err)
        doc.constructor.emit('es-indexed', err)
      }
    } else {
      doc.emit('es-filtered')
      doc.constructor.emit('es-filtered')

      if (!data.wasNew) {
        const res = await doc.esRemove()

        doc.emit('es-removed', res)
        doc.constructor.emit('es-removed', res)
      }
    }
  }
}
