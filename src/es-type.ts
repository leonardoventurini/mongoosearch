export enum ESType {
  /**
   * Defines an alias for an existing field.
   */
  Alias = 'alias',

  /**
   * A signed 64-bit integer with a minimum value of -263 and a maximum value
   * of 2^63-1.
   */
  Long = 'long',

  /**
   * A signed 32-bit integer with a minimum value of -231 and a maximum value
   * of 2^31-1.
   */
  Integer = 'integer',

  /**
   * A signed 16-bit integer with a minimum value of -32,768 and a maximum
   * value of 32,767.
   */
  Short = 'short',

  /**
   * A signed 8-bit integer with a minimum value of -128 and a maximum value of
   * 127.
   */
  Byte = 'byte',

  /**
   * A double-precision 64-bit IEEE 754 floating point number, restricted to
   * finite values.
   */
  Double = 'double',

  /**
   * A single-precision 32-bit IEEE 754 floating point number, restricted to
   * finite values.
   */
  Float = 'float',

  /**
   * A half-precision 16-bit IEEE 754 floating point number, restricted to
   * finite values.
   */
  HalfFloat = 'half_float',

  /**
   * A floating point number that is backed by a long, scaled by a fixed double
   * scaling factor.
   */
  ScaledFloat = 'scaled_float',

  /**
   * An unsigned 64-bit integer with a minimum value of 0 and a maximum value
   * of 2^64-1.
   */
  UnsignedLong = 'unsigned_long',

  /**
   * Binary value encoded as a Base64 string.
   */
  Binary = 'binary',

  /**
   * True and false values.
   */
  Boolean = 'boolean',

  /**
   * Used for structured content such as IDs, email addresses, hostnames,
   * status codes, zip codes, or tags.
   */
  Keyword = 'keyword',

  /**
   * For keyword fields that always contain the same value.
   */
  ConstantKeyword = 'constant_keyword',

  /**
   * For unstructured machine-generated content. The wildcard type is optimized
   * for fields with large values or high cardinality.
   */
  Wildcard = 'wildcard',

  /**
   * JSON doesn’t have a date data type, so dates in Elasticsearch can either
   * be: strings containing formatted dates, e.g. "2015-01-01" or "2015/01/01
   * 12:10:30"; a number representing milliseconds-since-the-epoch; a number
   * representing seconds-since-the-epoch.
   */
  Date = 'date',

  /**
   * This data type is an addition to the date data type. However there is an
   * important distinction between the two. The existing date data type stores
   * dates in millisecond resolution. The date_nanos data type stores dates in
   * nanosecond resolution, which limits its range of dates from roughly 1970
   * to 2262, as dates are still stored as a long representing nanoseconds
   * since the epoch.
   */
  DateNanos = 'date_nanos',

  /**
   * A JSON object.
   */
  Object = 'object',

  /**
   * An entire JSON object as a single field value.
   */
  Flattened = 'flattened',

  /**
   * A JSON object that preserves the relationship between its subfields.
   */
  Nested = 'nexted',

  /**
   * Defines a parent/child relationship for documents in the same index.
   */
  Join = 'join',

  /**
   * A range of signed 32-bit integers with a minimum value of -2^31 and
   * maximum of 2^31-1.
   */
  IntegerRange = 'integer_range',

  /**
   * A range of single-precision 32-bit IEEE 754 floating point values.
   */
  FloatRange = 'float_range',

  /**
   * A range of signed 64-bit integers with a minimum value of -2^63 and maximum
   * of 2^63-1.
   */
  LongRange = 'long_range',

  /**
   * A range of double-precision 64-bit IEEE 754 floating point values.
   */
  DoubleRange = 'double_range',

  /**
   * A range of date values. Date ranges support various date formats through
   * the format mapping parameter. Regardless of the format used, date values
   * are parsed into an unsigned 64-bit integer representing milliseconds since
   * the Unix epoch in UTC. Values containing the now date math expression are
   * not supported.
   */
  DateRange = 'date_range',

  /**
   * A range of ip values supporting either IPv4 or IPv6 (or mixed) addresses.
   */
  IpRange = 'ip_range',

  /**
   * IPv4 and IPv6 addresses.
   */
  Ip = 'ip',

  /**
   * Software versions. Supports Semantic Versioning precedence rules.
   */
  Version = 'version',

  /**
   * Compute and stores hashes of values.
   */
  Murmur3 = 'murmur3',

  /**
   * Pre-aggregated metric values.
   */
  AggregateMetricDouble = 'aggregate_metric_double',

  /**
   * Pre-aggregated numerical values in the form of a histogram.
   */
  Histogram = 'histogram',

  /**
   * The traditional field type for full-text content such as the body of an
   * email or the description of a product.
   */
  Text = 'text',

  /**
   * A space-optimized variant of text that disables scoring and performs
   * slower on queries that need positions. It is best suited for indexing log
   * messages.
   */
  MatchOnlyText = 'match_only_text',

  /**
   * Used for auto-complete suggestions.
   */
  Completion = 'completion',

  /**
   * Text-like type for as-you-type completion.
   */
  SearchAsYouType = 'search_as_you_type',

  /**
   * A count of tokens in a text.
   */
  TokenCount = 'token_count',

  /**
   * Records dense vectors of float values.
   */
  DenseVector = 'dense_vector',

  /**
   * Records sparse vectors of float values.
   */
  SparseVector = 'sparse_vector',

  /**
   * Records a numeric feature to boost hits at query time.
   */
  RankFeature = 'rank_feature',

  /**
   * Records numeric features to boost hits at query time.
   */
  RankFeatures = 'rank_features',

  /**
   * Latitude and longitude points.
   */
  GeoPoint = 'geo_point',

  /**
   * Complex shapes, such as polygons.
   */
  GeoShape = 'geo_shape',

  /**
   * Arbitrary cartesian points.
   */
  Point = 'point',

  /**
   * Arbitrary cartesian geometries.
   */
  Shape = 'shape',
}
