import {
  ConversionOptions,
  ConversionResult,
  JsonInput,
  ParseError,
  TransformationError,
} from '../types/index.js';
import {
  flattenObject,
  escapeCsvValue,
  formatValue,
  validateAndParseJson,
  getAllKeys,
  validateOptions,
} from '../utils/index.js';

/**
 * Main JSON to CSV converter class
 */
export class JsonToCsvConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions = {}) {
    this.options = validateOptions(options);
  }

  /**
   * Converts JSON input to CSV format
   * @param input - JSON string, object, or array of objects
   * @returns Conversion result with CSV data and metadata
   */
  public convert(input: JsonInput): ConversionResult {
    try {
      const jsonData = validateAndParseJson(input);
      const dataArray = this.normalizeToArray(jsonData);
      
      if (dataArray.length === 0) {
        return {
          data: this.options.includeHeaders ? this.options.delimiter || ',' : '',
          rowCount: 0,
          columnCount: 0,
          headers: [],
          warnings: ['Input data is empty'],
        };
      }

      const result = this.processData(dataArray);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new ParseError(`Failed to convert JSON to CSV: ${error.message}`, { originalError: error });
      }
      throw new ParseError('Unknown error occurred during conversion');
    }
  }

  /**
   * Converts JSON input to CSV string directly
   * @param input - JSON string, object, or array of objects
   * @returns CSV string
   */
  public convertToString(input: JsonInput): string {
    return this.convert(input).data;
  }

  /**
   * Processes an array of objects and converts to CSV
   * @param dataArray - Array of objects to process
   * @returns Conversion result
   */
  private processData(dataArray: object[]): ConversionResult {
    const warnings: string[] = [];
    let processedData: object[] = [];

    // Handle array fields that require separate rows
    if (this.options.arrayHandling === 'separate-rows') {
      processedData = this.expandArraysToRows(dataArray);
    } else {
      processedData = dataArray;
    }

    // Flatten all objects
    const flattenedData = processedData.map((obj, index) => {
      try {
        return flattenObject(obj, this.options);
      } catch (error) {
        warnings.push(`Warning: Failed to flatten object at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {};
      }
    });

    // Get all unique column headers
    const headers = getAllKeys(flattenedData, this.options);
    
    if (headers.length === 0) {
      warnings.push('No valid columns found in data');
    }

    // Generate CSV content
    const csvRows: string[] = [];

    // Add headers if requested
    if (this.options.includeHeaders && headers.length > 0) {
      const headerRow = headers
        .map(header => escapeCsvValue(header, this.options.delimiter))
        .join(this.options.delimiter);
      csvRows.push(headerRow);
    }

    // Add data rows
    for (let i = 0; i < flattenedData.length; i++) {
      const row = flattenedData[i];
      if (!row || Object.keys(row).length === 0) {
        warnings.push(`Warning: Empty or invalid row at index ${i}`);
        continue;
      }

      try {
        const csvRow = headers
          .map(header => {
            const value = row[header];
            const formattedValue = formatValue(value, header, this.options);
            return escapeCsvValue(formattedValue, this.options.delimiter);
          })
          .join(this.options.delimiter);
        
        csvRows.push(csvRow);
      } catch (error) {
        warnings.push(`Warning: Failed to process row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const csvData = csvRows.join('\n');

    return {
      data: csvData,
      rowCount: csvRows.length - (this.options.includeHeaders ? 1 : 0),
      columnCount: headers.length,
      headers,
      warnings,
    };
  }

  /**
   * Normalizes input to an array of objects
   * @param data - Input data
   * @returns Array of objects
   */
  private normalizeToArray(data: object | object[]): object[] {
    if (Array.isArray(data)) {
      return data;
    }

    // If it's a single object, wrap it in an array
    if (typeof data === 'object' && data !== null) {
      // Check if the object has an array property that should be the main data
      // This handles cases like { "data": [...] }
      const arrayProperties = Object.entries(data)
        .filter(([, value]) => Array.isArray(value))
        .sort(([, a], [, b]) => b.length - a.length); // Sort by array length, longest first

      if (arrayProperties.length > 0) {
        const firstArrayProperty = arrayProperties[0];
        if (firstArrayProperty) {
          const [, largestArray] = firstArrayProperty;
          return largestArray as object[];
        }
      }

      return [data];
    }

    throw new TransformationError('Input must be an object or array of objects');
  }

  /**
   * Expands objects with array properties into multiple rows
   * @param dataArray - Array of objects to expand
   * @returns Expanded array with separate rows for array elements
   */
  private expandArraysToRows(dataArray: object[]): object[] {
    const expandedData: object[] = [];

    for (const obj of dataArray) {
      const expandedRows = this.expandSingleObjectArrays(obj);
      expandedData.push(...expandedRows);
    }

    return expandedData;
  }

  /**
   * Expands a single object's array properties into multiple rows
   * @param obj - Object to expand
   * @returns Array of expanded objects
   */
  private expandSingleObjectArrays(obj: any): object[] {
    const arrayFields: [string, any[]][] = [];
    const nonArrayFields: Record<string, any> = {};

    // Separate array and non-array fields
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && value.length > 0) {
        arrayFields.push([key, value]);
      } else {
        nonArrayFields[key] = value;
      }
    }

    // If no array fields, return the original object
    if (arrayFields.length === 0) {
      return [obj];
    }

    // Find the maximum array length to determine number of rows
    const maxLength = Math.max(...arrayFields.map(([, arr]) => arr.length));
    const expandedRows: object[] = [];

    for (let i = 0; i < maxLength; i++) {
      const row = { ...nonArrayFields };

      // Add array elements at the current index
      for (const [fieldName, array] of arrayFields) {
        if (i < array.length) {
          const element = array[i];
          if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
            // If array element is an object, flatten it with the field name as prefix
            const flattened = flattenObject(element, this.options, fieldName);
            Object.assign(row, flattened);
          } else {
            row[fieldName] = element;
          }
        } else {
          // Fill with null value for shorter arrays
          row[fieldName] = this.options.nullValue ?? '';
        }
      }

      expandedRows.push(row);
    }

    return expandedRows;
  }
}

/**
 * Convenience function to convert JSON to CSV with default options
 * @param input - JSON input
 * @param options - Conversion options
 * @returns CSV string
 */
export function jsonToCsv(input: JsonInput, options?: ConversionOptions): string {
  const converter = new JsonToCsvConverter(options);
  return converter.convertToString(input);
}

/**
 * Convenience function to get detailed conversion results
 * @param input - JSON input
 * @param options - Conversion options
 * @returns Detailed conversion result
 */
export function jsonToCsvDetailed(input: JsonInput, options?: ConversionOptions): ConversionResult {
  const converter = new JsonToCsvConverter(options);
  return converter.convert(input);
}
