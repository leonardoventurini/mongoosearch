export async function esDeleteIndex() {
  const { client, index } = this.esOptions()

  const exists = await this.esExists()

  return exists
    ? await client.indices.delete(
        {
          index,
        },
        { requestTimeout: 60 },
      )
    : false
}
