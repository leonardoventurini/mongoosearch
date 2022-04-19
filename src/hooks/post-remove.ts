export async function postRemove(doc) {
  if (doc && doc.esOptions) {
    const res = await doc.esRemove()

    doc.emit('es-removed', res)
    doc.constructor.emit('es-removed', res)
  }
}
