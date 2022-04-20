export async function esDeleteIndex() {
  const { client, index } = this.esOptions()

  const exists = await this.esExists()

  if (exists) {
    return await client.indices.delete(
      {
        index,
      },
      { requestTimeout: 60 },
    )
  }

  return false
}
