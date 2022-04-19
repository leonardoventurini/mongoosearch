export async function esExists() {
  const { client, index } = this.esOptions()

  try {
    return await client.indices.exists(
      {
        index,
      },
      { silent: true },
    )
  } catch (error) {
    return false
  }
}
