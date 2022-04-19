export async function esExists() {
  const { client, index } = this.esOptions()

  try {
    const result = await client.indices.exists(
      {
        index,
      },
      { silent: true },
    )

    return result?.body === true
  } catch (error) {
    return false
  }
}
