export interface OperatorDef {
  name: string;
  description: string;
  params: ParamDef[];
  example?: string;
}

export interface ParamDef {
  name: string;
  description: string;
  required?: boolean;
}

export const OPERATORS: OperatorDef[] = [
  // ─── Shell / Script Operators ──────────────────────────────────────
  {
    name: "sh>",
    description: "Runs a shell command or script.",
    params: [
      { name: "sh>", description: "Shell script command to execute", required: true },
      { name: "shell", description: "Shell executable to use (default: [/bin/sh])" },
    ],
    example: "sh>: echo 'hello'",
  },
  {
    name: "py>",
    description: "Runs a Python function.",
    params: [
      { name: "py>", description: "Python module.function to call", required: true },
      { name: "python", description: "Python executable path or command array (default: 'python')" },
      { name: "docker", description: "Docker configuration for running in a container" },
    ],
    example: "py>: my_module.my_func",
  },
  {
    name: "rb>",
    description: "Runs a Ruby method.",
    params: [
      { name: "rb>", description: "Ruby Class.method to call", required: true },
      { name: "require", description: "Ruby file to require before execution" },
      { name: "ruby", description: "Ruby executable path or command array (default: 'ruby')" },
      { name: "docker", description: "Docker configuration for running in a container" },
    ],
    example: "rb>: MyClass.my_method",
  },

  // ─── Treasure Data Operators ───────────────────────────────────────
  {
    name: "td>",
    description: "Runs a Treasure Data query.",
    params: [
      { name: "td>", description: "Path to a query template file", required: true },
      { name: "query", description: "Inline query string (alternative to td>)" },
      { name: "database", description: "Target database" },
      { name: "engine", description: "Query engine: 'presto' (default) or 'hive'" },
      { name: "engine_version", description: "Engine version" },
      { name: "hive_engine_version", description: "Override engine_version for Hive" },
      { name: "create_table", description: "Create a table from query results" },
      { name: "insert_into", description: "Append query results into a table" },
      { name: "download_file", description: "Save query results as a local CSV file" },
      { name: "result_url", description: "Output query results to the specified URL" },
      { name: "result_connection", description: "Name of a saved connection for result output" },
      { name: "result_settings", description: "Additional settings for result_connection (MAP). Only valid with result_connection" },
      { name: "priority", description: "Job priority from -2 (VERY LOW) to 2 (VERY HIGH)" },
      { name: "job_retry", description: "Number of automatic job retries on failure" },
      { name: "presto_pool_name", description: "Resource pool name for Presto queries" },
      { name: "hive_pool_name", description: "Resource pool name for Hive queries" },
      { name: "store_last_results", description: "Store the first row of results into ${td.last_results}" },
      { name: "preview", description: "Log the first 20 rows of query results" },
      { name: "endpoint", description: "TD API endpoint address" },
      { name: "use_ssl", description: "Whether to use HTTPS to connect" },
      { name: "proxy", description: "Proxy configuration (MAP with host, port, user, password, use_ssl)" },
    ],
    example: "td>: queries/my_query.sql",
  },
  {
    name: "td_ddl>",
    description: "Manages Treasure Data databases and tables (create, drop, rename, empty).",
    params: [
      { name: "td_ddl>", description: "Operation type", required: true },
      { name: "create_databases", description: "List of databases to create" },
      { name: "drop_databases", description: "List of databases to drop" },
      { name: "empty_databases", description: "List of databases to empty (drop then recreate)" },
      { name: "create_tables", description: "List of tables to create (each with database, table)" },
      { name: "drop_tables", description: "List of tables to drop (each with database, table)" },
      { name: "empty_tables", description: "List of tables to empty (drop then recreate)" },
      { name: "rename_tables", description: "List of table rename operations (each with from, to)" },
    ],
  },
  {
    name: "td_load>",
    description: "Runs a Treasure Data bulk load session.",
    params: [
      { name: "td_load>", description: "Bulk load session name, YAML config file path, or inline config", required: true },
      { name: "table", description: "Destination database.table for bulk load", required: true },
      { name: "name", description: "Bulk load session name to reference (mutually exclusive with config)" },
      { name: "config", description: "Inline Embulk configuration (mutually exclusive with name)" },
    ],
  },
  {
    name: "td_table_export>",
    description: "Exports a Treasure Data table to S3.",
    params: [
      { name: "td_table_export>", description: "Table to export (database.table)", required: true },
      { name: "file_format", description: "Output format (e.g., msgpack.gz, json.gz, tsv.gz)", required: true },
      { name: "from", description: "Start time (epoch seconds or 'yyyy-MM-dd HH:mm:ss Z')", required: true },
      { name: "to", description: "End time (epoch seconds or 'yyyy-MM-dd HH:mm:ss Z')", required: true },
      { name: "s3_bucket", description: "Target S3 bucket name", required: true },
      { name: "s3_path_prefix", description: "Prefix path within S3 bucket", required: true },
    ],
  },
  {
    name: "td_wait>",
    description: "Runs a query and waits until the result is truthy (non-null, non-zero, non-false).",
    params: [
      { name: "td_wait>", description: "Path to query template file or inline query", required: true },
      { name: "engine", description: "Query engine: 'presto' (default) or 'hive'" },
      { name: "engine_version", description: "Engine version to use" },
      { name: "hive_engine_version", description: "Override engine_version when engine is hive" },
      { name: "priority", description: "Job priority (default: 0)" },
      { name: "job_retry", description: "Number of automatic job retries (default: 0)" },
      { name: "pool_name", description: "Resource pool assignment for job execution" },
      { name: "interval", description: "Polling interval duration (default: 10m)" },
    ],
  },
  {
    name: "td_wait_table>",
    description: "Waits for a table to exist in Treasure Data, optionally with a minimum row count.",
    params: [
      { name: "td_wait_table>", description: "Table to wait for (database.table)", required: true },
      { name: "rows", description: "Minimum row count threshold (default: 0, meaning just check existence)" },
      { name: "engine", description: "Query engine: 'presto' (default) or 'hive'" },
      { name: "engine_version", description: "Engine version to use" },
      { name: "hive_engine_version", description: "Override engine_version when engine is hive" },
      { name: "priority", description: "Job priority (default: 0)" },
      { name: "job_retry", description: "Number of automatic job retries (default: 0)" },
      { name: "interval", description: "Polling interval duration (default: 10m)" },
    ],
  },
  {
    name: "td_for_each>",
    description: "Runs a query and executes subtasks for each result row.",
    params: [
      { name: "td_for_each>", description: "Path to query template file or inline query", required: true },
      { name: "_do", description: "Subtask definition to execute for each result row", required: true },
      { name: "engine", description: "Query engine: 'presto' (default) or 'hive'" },
      { name: "engine_version", description: "Engine version to use" },
      { name: "hive_engine_version", description: "Override engine_version when engine is hive" },
      { name: "priority", description: "Job priority (default: 0)" },
      { name: "job_retry", description: "Number of automatic job retries (default: 0)" },
    ],
  },
  {
    name: "td_partial_delete>",
    description: "Deletes data from a Treasure Data table within a specified time range.",
    params: [
      { name: "td_partial_delete>", description: "Target table (database.table)", required: true },
      { name: "from", description: "Start time for deletion range (must be whole hour boundary)", required: true },
      { name: "to", description: "End time for deletion range (must be whole hour boundary)", required: true },
    ],
  },
  {
    name: "td_run>",
    description: "Runs a saved Treasure Data query.",
    params: [
      { name: "td_run>", description: "Saved query name or numeric ID", required: true },
      { name: "session_time", description: "Scheduled execution time for the query", required: true },
      { name: "download_file", description: "File path to save query results" },
      { name: "store_last_results", description: "Store the final query results (default: false)" },
      { name: "preview", description: "Download preview rows from job output (default: false)" },
    ],
  },

  // ─── Mail Operator ─────────────────────────────────────────────────
  {
    name: "mail>",
    description: "Sends an email notification.",
    params: [
      { name: "mail>", description: "Email body template file path", required: true },
      { name: "body", description: "Email body content (template processed)" },
      { name: "subject", description: "Email subject line" },
      { name: "to", description: "Recipient email address(es)", required: true },
      { name: "cc", description: "Carbon copy recipients" },
      { name: "bcc", description: "Blind carbon copy recipients" },
      { name: "from", description: "Sender email address" },
      { name: "html", description: "Treat body as HTML (default: false)" },
      { name: "attach_files", description: "Files to attach (list with path, filename, content_type)" },
      { name: "host", description: "SMTP server hostname" },
      { name: "port", description: "SMTP server port" },
      { name: "tls", description: "Enable STARTTLS encryption (default: true)" },
      { name: "ssl", description: "Enable SSL socket factory (default: false)" },
      { name: "username", description: "SMTP authentication username" },
    ],
    example: "mail>: body.txt",
  },

  // ─── HTTP Operator ─────────────────────────────────────────────────
  {
    name: "http>",
    description: "Makes an HTTP request.",
    params: [
      { name: "http>", description: "URL to request", required: true },
      { name: "method", description: "HTTP method: GET (default), POST, PUT, DELETE, etc." },
      { name: "content", description: "Request body content (JSON, text, or form data)" },
      { name: "content_format", description: "Content encoding: text, json, or form" },
      { name: "content_type", description: "MIME type for content (e.g., application/json)" },
      { name: "headers", description: "Custom HTTP headers (list of key-value objects)" },
      { name: "query", description: "Query string parameters (string or nested config)" },
      { name: "retry", description: "Enable automatic retry on failure (default: inferred from method)" },
      { name: "timeout", description: "Request timeout in seconds (default: 30)" },
      { name: "store_content", description: "Store response body in results (default: false)" },
      { name: "follow_redirects", description: "Follow HTTP redirects (default: true)" },
      { name: "insecure", description: "Disable SSL certificate validation (default: false)" },
      { name: "proxy", description: "Proxy config with enabled, host, port, tls" },
    ],
    example: "http>: https://api.example.com/data",
  },

  // ─── S3 / GCS Wait Operators ───────────────────────────────────────
  {
    name: "s3_wait>",
    description: "Waits for an Amazon S3 object to appear.",
    params: [
      { name: "s3_wait>", description: "S3 path (bucket/key) to wait for", required: true },
      { name: "bucket", description: "S3 bucket name (alternative to inline path)" },
      { name: "key", description: "S3 object key (alternative to inline path)" },
      { name: "version_id", description: "Specific S3 object version to wait for" },
      { name: "region", description: "AWS region" },
      { name: "endpoint", description: "Custom S3 endpoint URL" },
      { name: "path_style_access", description: "Enable path-style S3 URL access" },
      { name: "timeout", description: "Maximum wait time before timeout (duration string)" },
      { name: "continue_on_timeout", description: "Succeed despite timeout (default: false)" },
      { name: "sse_c_key", description: "Server-side encryption customer key" },
      { name: "sse_c_key_algorithm", description: "SSE customer key algorithm" },
      { name: "sse_c_key_md5", description: "SSE customer key MD5 hash" },
      { name: "interval", description: "Polling interval duration" },
    ],
  },
  {
    name: "gcs_wait>",
    description: "Waits for a Google Cloud Storage object to appear.",
    params: [
      { name: "gcs_wait>", description: "GCS URI (gs://bucket/object) to wait for", required: true },
      { name: "bucket", description: "GCS bucket name (alternative to inline URI)" },
      { name: "object", description: "GCS object path (alternative to inline URI)" },
      { name: "interval", description: "Polling interval duration" },
    ],
  },

  // ─── Redshift Operators ────────────────────────────────────────────
  {
    name: "redshift>",
    description: "Runs a SQL query on Amazon Redshift.",
    params: [
      { name: "redshift>", description: "SQL query string or path to query template file", required: true },
      { name: "host", description: "Redshift cluster hostname" },
      { name: "port", description: "Redshift port (default: 5439)" },
      { name: "user", description: "Database username" },
      { name: "password", description: "Database password (via secrets)" },
      { name: "database", description: "Database name" },
      { name: "ssl", description: "Enable SSL connection (default: false)" },
      { name: "schema", description: "Default schema for queries" },
      { name: "connect_timeout", description: "Connection timeout (default: 30s)" },
      { name: "socket_timeout", description: "Socket read/write timeout (default: 1800s)" },
      { name: "insert_into", description: "Table to INSERT query results into" },
      { name: "create_table", description: "Table to CREATE from query results" },
      { name: "download_file", description: "File path to download results as CSV" },
      { name: "store_last_results", description: "Store query results: false (default), first, all" },
      { name: "strict_transaction", description: "Enable strict transaction mode (default: true)" },
      { name: "status_table", description: "Status tracking table name (default: __digdag_status)" },
      { name: "status_table_schema", description: "Schema for status table" },
      { name: "status_table_cleanup", description: "Retention duration for status records (default: 24h)" },
    ],
  },
  {
    name: "redshift_load>",
    description: "Loads data into Amazon Redshift from S3 using COPY command.",
    params: [
      { name: "redshift_load>", description: "Target table name", required: true },
      { name: "from", description: "Source S3 URI", required: true },
      { name: "host", description: "Redshift cluster hostname" },
      { name: "port", description: "Redshift port (default: 5439)" },
      { name: "user", description: "Database username" },
      { name: "password", description: "Database password (via secrets)" },
      { name: "database", description: "Database name" },
      { name: "ssl", description: "Enable SSL connection (default: false)" },
      { name: "schema", description: "Default schema" },
      { name: "column_list", description: "Columns to receive data" },
      { name: "manifest", description: "Source is a manifest file listing" },
      { name: "encrypted", description: "Source files are encrypted" },
      { name: "region", description: "AWS region for COPY command" },
      { name: "readratio", description: "Parallel processing ratio" },
      { name: "csv", description: "CSV format with optional quote character" },
      { name: "delimiter", description: "Field separator character" },
      { name: "fixedwidth", description: "Fixed-width column specifications" },
      { name: "json", description: "JSON format or 'auto' detection" },
      { name: "avro", description: "Avro format or 'auto' detection" },
      { name: "gzip", description: "Enable gzip decompression" },
      { name: "bzip2", description: "Enable bzip2 decompression" },
      { name: "lzop", description: "Enable lzop decompression" },
      { name: "acceptanydate", description: "Allow non-standard date formats" },
      { name: "acceptinvchars", description: "Replacement char for invalid characters" },
      { name: "blanksasnull", description: "Treat blank fields as NULL" },
      { name: "dateformat", description: "Expected date format pattern" },
      { name: "emptyasnull", description: "Treat empty strings as NULL" },
      { name: "encoding", description: "Character encoding of source" },
      { name: "escape", description: "Enable escape character processing" },
      { name: "explicit_ids", description: "Allow explicit identity column values" },
      { name: "fillrecord", description: "Pad incomplete records with NULLs" },
      { name: "ignoreblanklines", description: "Skip blank input lines" },
      { name: "ignoreheader", description: "Number of header rows to skip" },
      { name: "null_as", description: "String representing NULL values" },
      { name: "removequotes", description: "Strip surrounding quotes from fields" },
      { name: "roundec", description: "Round decimal values" },
      { name: "timeformat", description: "Expected time format pattern" },
      { name: "trimblanks", description: "Remove leading/trailing whitespace" },
      { name: "truncatecolumns", description: "Truncate oversized column values" },
      { name: "comprows", description: "Compression analysis row count" },
      { name: "compupdate", description: "Control compression during load" },
      { name: "maxerror", description: "Maximum tolerable error count" },
      { name: "noload", description: "Validate without executing load" },
      { name: "statupdate", description: "Control statistics update behavior" },
      { name: "temp_credentials", description: "Use temporary AWS credentials (default: true)" },
      { name: "session_duration", description: "Duration in seconds for AWS session credentials" },
      { name: "strict_transaction", description: "Enable strict transaction mode (default: true)" },
      { name: "status_table", description: "Status tracking table name (default: __digdag_status)" },
    ],
  },
  {
    name: "redshift_unload>",
    description: "Unloads data from Amazon Redshift to S3 using UNLOAD command.",
    params: [
      { name: "redshift_unload>", description: "SQL query to unload", required: true },
      { name: "to", description: "S3 destination path", required: true },
      { name: "host", description: "Redshift cluster hostname" },
      { name: "port", description: "Redshift port (default: 5439)" },
      { name: "user", description: "Database username" },
      { name: "password", description: "Database password (via secrets)" },
      { name: "database", description: "Database name" },
      { name: "ssl", description: "Enable SSL connection (default: false)" },
      { name: "schema", description: "Default schema" },
      { name: "manifest", description: "Create a manifest file listing unloaded files" },
      { name: "encrypted", description: "Encrypt unloaded files in S3" },
      { name: "allowoverwrite", description: "Overwrite existing files at destination" },
      { name: "delimiter", description: "Field delimiter character" },
      { name: "fixedwidth", description: "Fixed-width specification" },
      { name: "gzip", description: "Compress output with gzip" },
      { name: "bzip2", description: "Compress output with bzip2" },
      { name: "null_as", description: "String representation for NULL values" },
      { name: "escape", description: "Escape special characters" },
      { name: "addquotes", description: "Add quotes around fields" },
      { name: "parallel", description: "Parallel processing configuration" },
      { name: "temp_credentials", description: "Use temporary AWS credentials (default: true)" },
      { name: "session_duration", description: "Duration in seconds for AWS session credentials" },
      { name: "strict_transaction", description: "Enable strict transaction mode (default: true)" },
      { name: "status_table", description: "Status tracking table name (default: __digdag_status)" },
    ],
  },

  // ─── PostgreSQL Operator ───────────────────────────────────────────
  {
    name: "pg>",
    description: "Runs a SQL query on PostgreSQL.",
    params: [
      { name: "pg>", description: "SQL query string or path to query template file", required: true },
      { name: "host", description: "PostgreSQL hostname" },
      { name: "port", description: "PostgreSQL port (default: 5432)" },
      { name: "user", description: "Database username" },
      { name: "password", description: "Database password (via secrets)" },
      { name: "database", description: "Database name" },
      { name: "ssl", description: "Enable SSL connection (default: false)" },
      { name: "schema", description: "Default schema for queries" },
      { name: "connect_timeout", description: "Connection timeout (default: 30s)" },
      { name: "socket_timeout", description: "Socket read/write timeout (default: 1800s)" },
      { name: "insert_into", description: "Table to INSERT query results into" },
      { name: "create_table", description: "Table to CREATE from query results" },
      { name: "download_file", description: "File path to download results as CSV" },
      { name: "store_last_results", description: "Store query results: false (default), first, all" },
      { name: "strict_transaction", description: "Enable strict transaction mode (default: true)" },
      { name: "status_table", description: "Status tracking table name (default: __digdag_status)" },
      { name: "status_table_schema", description: "Schema for status table" },
      { name: "status_table_cleanup", description: "Retention duration for status records (default: 24h)" },
    ],
  },

  // ─── BigQuery Operators ────────────────────────────────────────────
  {
    name: "bq>",
    description: "Runs a Google BigQuery query.",
    params: [
      { name: "bq>", description: "SQL query string or path to query template file", required: true },
      { name: "dataset", description: "Default dataset for unqualified table references" },
      { name: "destination_table", description: "Table to write query results to" },
      { name: "use_legacy_sql", description: "Use legacy SQL syntax (default: false)" },
      { name: "allow_large_results", description: "Allow large result sets written to destination table" },
      { name: "use_query_cache", description: "Use cached results if available" },
      { name: "create_disposition", description: "Table creation behavior (CREATE_IF_NEEDED, CREATE_NEVER)" },
      { name: "write_disposition", description: "Write behavior (WRITE_TRUNCATE, WRITE_APPEND, WRITE_EMPTY)" },
      { name: "flatten_results", description: "Flatten nested and repeated fields in results" },
      { name: "maximum_billing_tier", description: "Maximum billing tier for query" },
      { name: "priority", description: "Query priority: INTERACTIVE or BATCH" },
      { name: "table_definitions", description: "External data sources as temporary tables (MAP)" },
      { name: "user_defined_function_resources", description: "Custom UDF code resources (LIST)" },
    ],
    example: "bq>: queries/my_query.sql",
  },
  {
    name: "bq_ddl>",
    description: "Manages BigQuery datasets and tables (create, delete, empty).",
    params: [
      { name: "bq_ddl>", description: "Operation type", required: true },
      { name: "dataset", description: "Default dataset reference for table operations" },
      { name: "create_datasets", description: "Datasets to create (list with id, project, friendly_name, default_table_expiration, location, access, labels)" },
      { name: "delete_datasets", description: "Datasets to delete (list)" },
      { name: "empty_datasets", description: "Datasets to empty (list)" },
      { name: "create_tables", description: "Tables to create (list with id, dataset, project, friendly_name, description, expiration_time, schema, time_partitioning, view, labels)" },
      { name: "delete_tables", description: "Tables to delete (list)" },
      { name: "empty_tables", description: "Tables to empty (list)" },
    ],
  },
  {
    name: "bq_extract>",
    description: "Extracts data from a BigQuery table to Google Cloud Storage.",
    params: [
      { name: "bq_extract>", description: "Source table to extract from", required: true },
      { name: "destination", description: "Target GCS URI(s) for extracted data", required: true },
      { name: "dataset", description: "Default dataset for resolving source table" },
      { name: "print_header", description: "Include column headers in output" },
      { name: "field_delimiter", description: "Character separating fields in export" },
      { name: "destination_format", description: "Output format: CSV, NEWLINE_DELIMITED_JSON, AVRO" },
      { name: "compression", description: "Compression method: NONE, GZIP" },
    ],
  },
  {
    name: "bq_load>",
    description: "Loads data into a BigQuery table from Google Cloud Storage.",
    params: [
      { name: "bq_load>", description: "Source GCS URI(s) to load from", required: true },
      { name: "destination_table", description: "Target BigQuery table", required: true },
      { name: "dataset", description: "Default dataset reference" },
      { name: "schema", description: "Table schema definition (inline object or JSON/YAML file path)" },
      { name: "source_format", description: "Format of source data: CSV, NEWLINE_DELIMITED_JSON, AVRO, DATASTORE_BACKUP" },
      { name: "create_disposition", description: "Table creation behavior (CREATE_IF_NEEDED, CREATE_NEVER)" },
      { name: "write_disposition", description: "Write behavior (WRITE_TRUNCATE, WRITE_APPEND, WRITE_EMPTY)" },
      { name: "field_delimiter", description: "Character separating fields in CSV source" },
      { name: "skip_leading_rows", description: "Number of header rows to skip" },
      { name: "encoding", description: "Character encoding: UTF-8 (default), ISO-8859-1" },
      { name: "quote", description: "Quote character in source data" },
      { name: "max_bad_records", description: "Maximum tolerated malformed records" },
      { name: "allow_quoted_newlines", description: "Allow newlines within quoted fields" },
      { name: "allow_jagged_rows", description: "Allow rows with missing trailing columns" },
      { name: "ignore_unknown_values", description: "Skip values not matching schema" },
      { name: "projection_fields", description: "Subset of fields to load (list)" },
      { name: "autodetect", description: "Automatically infer schema from data" },
      { name: "schema_update_options", description: "Schema modification behavior (list)" },
    ],
  },

  // ─── AWS EMR Operator ──────────────────────────────────────────────
  {
    name: "emr>",
    description: "Runs steps on an Amazon EMR cluster.",
    params: [
      { name: "emr>", description: "EMR step definition or operation", required: true },
      { name: "cluster", description: "Existing cluster ID (string) or new cluster config (MAP)" },
      { name: "steps", description: "List of step configs (each with type: flink/hive/spark/spark-sql/script/command)" },
      { name: "staging", description: "S3 URI for staging files during execution" },
      { name: "action_on_failure", description: "EMR action on step failure (default: CANCEL_AND_WAIT)" },
    ],
  },

  // ─── Embulk Operator ───────────────────────────────────────────────
  {
    name: "embulk>",
    description: "Runs an Embulk bulk data transfer.",
    params: [
      { name: "embulk>", description: "Embulk YAML config file path or inline template", required: true },
      { name: "config", description: "Structured Embulk configuration (alternative to file path)" },
    ],
    example: "embulk>: config/load.yml",
  },

  // ─── Flow Control Operators ────────────────────────────────────────
  {
    name: "call>",
    description: "Calls another workflow file and embeds its tasks.",
    params: [
      { name: "call>", description: "Workflow file to call (.dig extension auto-appended)", required: true },
    ],
    example: "call>: another_workflow.dig",
  },
  {
    name: "require>",
    description: "Requires another workflow to finish successfully before continuing.",
    params: [
      { name: "require>", description: "Workflow name to require", required: true },
      { name: "session_time", description: "Session timestamp for the required workflow attempt" },
      { name: "ignore_failure", description: "Succeed even if dependent workflow fails (default: false)" },
      { name: "rerun_on", description: "Rerun behavior: 'none' (default), 'failed', or 'all'" },
      { name: "params", description: "Override parameters passed to the dependent workflow (MAP)" },
      { name: "project_id", description: "Project ID override" },
      { name: "project_name", description: "Project name override (alternative to project_id)" },
      { name: "retry_attempt_name", description: "Custom attempt name for retry attempts" },
    ],
    example: "require>: other_project/workflow",
  },
  {
    name: "loop>",
    description: "Loops subtasks a specified number of times, exposing ${i} as the 0-based index.",
    params: [
      { name: "loop>", description: "Number of iterations", required: true },
      { name: "_do", description: "Subtask definition to repeat", required: true },
      { name: "_parallel", description: "Run iterations in parallel" },
    ],
    example: "loop>: 3",
  },
  {
    name: "for_each>",
    description: "Runs subtasks for each combination of parameter values.",
    params: [
      { name: "for_each>", description: "Parameter map where each key has a list of values", required: true },
      { name: "_do", description: "Subtask definition to execute for each combination", required: true },
      { name: "_parallel", description: "Run iterations in parallel" },
    ],
  },
  {
    name: "for_range>",
    description: "Runs subtasks for each value in a numeric range, exposing ${range.from}, ${range.to}, ${range.index}.",
    params: [
      { name: "for_range>", description: "Range configuration (MAP with from, to, step/slices)", required: true },
      { name: "from", description: "Start value of the range", required: true },
      { name: "to", description: "End value of the range (exclusive)", required: true },
      { name: "step", description: "Increment between iterations (mutually exclusive with slices)" },
      { name: "slices", description: "Number of partitions (mutually exclusive with step)" },
      { name: "_do", description: "Subtask definition to execute", required: true },
      { name: "_parallel", description: "Run iterations in parallel" },
    ],
  },
  {
    name: "if>",
    description: "Conditionally runs subtasks based on a boolean condition.",
    params: [
      { name: "if>", description: "Boolean condition to evaluate", required: true },
      { name: "_do", description: "Subtask to run if condition is true" },
      { name: "_else_do", description: "Subtask to run if condition is false" },
    ],
    example: "if>: ${condition}",
  },

  // ─── Utility Operators ─────────────────────────────────────────────
  {
    name: "fail>",
    description: "Fails the workflow with a custom error message.",
    params: [
      { name: "fail>", description: "Error message (default: empty string)", required: true },
    ],
    example: "fail>: 'This task failed intentionally'",
  },
  {
    name: "echo>",
    description: "Prints a message to stdout and the task log.",
    params: [
      { name: "echo>", description: "Message text to print", required: true },
    ],
    example: "echo>: 'Hello World'",
  },
  {
    name: "notify>",
    description: "Sends a notification message via the configured notifier.",
    params: [
      { name: "notify>", description: "Notification message content", required: true },
    ],
  },
  {
    name: "wait>",
    description: "Waits for a specified duration before continuing.",
    params: [
      { name: "wait>", description: "Duration to wait (e.g., '5s', '1m', '2h')", required: true },
      { name: "blocking", description: "Block execution synchronously (default: false, uses polling)" },
      { name: "poll_interval", description: "Polling interval when not blocking (duration string)" },
    ],
  },

  // ─── Param Operators ───────────────────────────────────────────────
  {
    name: "param_set>",
    description: "Sets workflow parameters in a persistent parameter server.",
    params: [
      { name: "param_set>", description: "Key-value map of parameters to set", required: true },
    ],
  },
  {
    name: "param_get>",
    description: "Gets workflow parameters from a persistent parameter server.",
    params: [
      { name: "param_get>", description: "Key map (source key -> destination key) to retrieve", required: true },
    ],
  },
];

const operatorMap = new Map<string, OperatorDef>();
for (const op of OPERATORS) {
  operatorMap.set(op.name, op);
}

export function getOperator(name: string): OperatorDef | undefined {
  return operatorMap.get(name);
}

export function isKnownOperator(name: string): boolean {
  return operatorMap.has(name);
}
