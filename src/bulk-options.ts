export type BulkOptions = {
  /**
   * Batch size to use on synchronise options. Defaults to 50.
   *
   * https://docs.mongodb.com/manual/reference/method/cursor.batchSize/
   */
  batch?: number

  /**
   * Bulk element count to wait before calling client.bulk function. Defaults
   * to 1000.
   */
  size?: number

  /**
   * Idle time to wait before calling the client.bulk function. Defaults to
   * 1000.
   */
  delay?: number
}
