export async function esExists() {
  const { client, index } = this.esOptions()

  try {
    return (
      (
        await client.indices.exists(
          {
            index,
          },
          { silent: true },
        )
      )?.status === 200
    )
  } catch (error) {
    return false
  }
}
