/**
 * JSON to CSV Toolkit - Main entry point
 * 
 * A comprehensive TypeScript/Node.js toolkit for converting JSON data to CSV format
 * with support for nested objects, arrays, and various data types.
 */

// Export main converter classes and functions
export { JsonToCsvConverter, jsonToCsv, jsonToCsvDetailed } from './converters/index.js';

// Export utility functions
export {
  flattenObject,
  escapeCsvValue,
  formatValue,
  formatNumber,
  formatDate,
  validateAndParseJson,
  getAllKeys,
  validateOptions,
} from './utils/index.js';

// Export all types
export type {
  ConversionOptions,
  JsonInput,
  CsvOutput,
  ConversionResult,
  CliOptions,
  PerformanceMetrics,
} from './types/index.js';

// Export error classes
export {
  JsonCsvError,
  ParseError,
  ValidationError,
  TransformationError,
} from './types/index.js';

// Default export for convenience
export { JsonToCsvConverter as default } from './converters/index.js';
