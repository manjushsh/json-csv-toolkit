/**
 * Configuration options for JSON to CSV conversion
 */
export interface ConversionOptions {
  /** Custom delimiter for CSV output (default: ',') */
  delimiter?: ',' | ';' | '\t' | string;
  
  /** Include header row in CSV output (default: true) */
  includeHeaders?: boolean;
  
  /** How to handle null or undefined values */
  nullValue?: string;
  
  /** How to handle arrays in JSON */
  arrayHandling?: 'flatten' | 'merge' | 'separate-rows';
  
  /** Custom field mappings for renaming columns */
  fieldMappings?: Record<string, string>;
  
  /** Custom transformations for specific fields */
  fieldTransformations?: Record<string, (value: any) => string>;
  
  /** Date format for date values */
  dateFormat?: string;
  
  /** Number formatting options */
  numberFormat?: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
  };
  
  /** How to handle duplicate keys */
  duplicateKeyHandling?: 'merge' | 'error' | 'suffix';
  
  /** Maximum depth for flattening nested objects */
  maxDepth?: number;
  
  /** Custom separator for flattened object keys */
  keySeparator?: string;
  
  /** Custom column ordering - columns will appear in this order */
  columnOrder?: string[];
  
  /** Whether to sort remaining columns alphabetically (default: true) */
  sortRemainingColumns?: boolean;
}

/**
 * Supported input sources for JSON data
 */
export type JsonInput = string | object | object[];

/**
 * Supported output formats
 */
export type CsvOutput = string | Buffer | NodeJS.ReadableStream;

/**
 * Result of a conversion operation
 */
export interface ConversionResult {
  /** The converted CSV data */
  data: string;
  
  /** Number of rows processed */
  rowCount: number;
  
  /** Number of columns in the output */
  columnCount: number;
  
  /** List of column headers */
  headers: string[];
  
  /** Any warnings generated during conversion */
  warnings: string[];
}

/**
 * Error types for different failure scenarios
 */
export class JsonCsvError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'JsonCsvError';
  }
}

export class ParseError extends JsonCsvError {
  constructor(message: string, details?: any) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}

export class ValidationError extends JsonCsvError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TransformationError extends JsonCsvError {
  constructor(message: string, details?: any) {
    super(message, 'TRANSFORMATION_ERROR', details);
    this.name = 'TransformationError';
  }
}

/**
 * CLI-specific options
 */
export interface CliOptions {
  /** Input file path or URL */
  input?: string;
  
  /** Output file path */
  output?: string;
  
  /** Enable verbose logging */
  verbose?: boolean;
  
  /** Show progress indicators */
  progress?: boolean;
  
  /** Process multiple files in batch */
  batch?: boolean;
  
  /** Validate JSON before processing */
  validate?: boolean;
  
  /** Custom delimiter for CSV output */
  delimiter?: string;
  
  /** Value to use for null/undefined fields */
  nullValue?: string;
  
  /** How to handle arrays in JSON */
  arrayHandling?: 'flatten' | 'merge' | 'separate-rows';
  
  /** Date format for date values */
  dateFormat?: string;
  
  /** Maximum depth for flattening nested objects */
  maxDepth?: number;
  
  /** Custom separator for flattened object keys */
  keySeparator?: string;
  
  /** Column order as comma-separated string */
  columnOrder?: string;
}

/**
 * Performance metrics for benchmarking
 */
export interface PerformanceMetrics {
  /** Processing time in milliseconds */
  processingTime: number;
  
  /** Memory usage in bytes */
  memoryUsage: number;
  
  /** Input data size in bytes */
  inputSize: number;
  
  /** Output data size in bytes */
  outputSize: number;
  
  /** Rows processed per second */
  throughput: number;
}
