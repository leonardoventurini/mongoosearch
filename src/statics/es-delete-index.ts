export async function esDeleteIndex() {
  const { client, index } = this.esOptions()

  if (!(await this.esExists())) return false

  try {
    return await client.indices.delete(
      {
        index,
      },
      { requestTimeout: 60 },
    )
  } catch (error) {
    console.error(error)
    return false
  }
}
