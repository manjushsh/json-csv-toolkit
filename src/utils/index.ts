import { ConversionOptions } from '../types/index.js';

/**
 * Flattens a nested object using dot notation
 * @param obj - The object to flatten
 * @param options - Conversion options
 * @param prefix - Current key prefix
 * @param depth - Current nesting depth
 * @returns Flattened object
 */
export function flattenObject(
  obj: any,
  options: ConversionOptions = {},
  prefix = '',
  depth = 0
): Record<string, any> {
  const keySeparator = options.keySeparator ?? '.';
  const maxDepth = options.maxDepth ?? Infinity;
  const result: Record<string, any> = {};

  if (depth >= maxDepth) {
    result[prefix || 'value'] = obj;
    return result;
  }

  if (obj === null || obj === undefined) {
    result[prefix || 'value'] = options.nullValue ?? '';
    return result;
  }

  if (typeof obj !== 'object' || obj instanceof Date) {
    result[prefix || 'value'] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    switch (options.arrayHandling) {
      case 'merge':
        result[prefix || 'value'] = obj.join(', ');
        break;
      case 'separate-rows':
        // This will be handled at a higher level
        result[prefix || 'value'] = obj;
        break;
      case 'flatten':
      default:
        obj.forEach((item, index) => {
          const key = prefix ? `${prefix}${keySeparator}${index}` : `${index}`;
          Object.assign(result, flattenObject(item, options, key, depth + 1));
        });
        break;
    }
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${keySeparator}${key}` : key;
    Object.assign(result, flattenObject(value, options, newKey, depth + 1));
  }

  return result;
}

/**
 * Escapes a string for CSV format
 * @param value - The value to escape
 * @param delimiter - The CSV delimiter
 * @returns Escaped string
 */
export function escapeCsvValue(value: any, delimiter = ','): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // Check if the value needs to be quoted
  const needsQuotes = 
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r');

  if (!needsQuotes) {
    return stringValue;
  }

  // Escape quotes by doubling them and wrap in quotes
  return `"${stringValue.replace(/"/g, '""')}"`;
}

/**
 * Formats a value according to the conversion options
 * @param value - The value to format
 * @param key - The key/field name
 * @param options - Conversion options
 * @returns Formatted string value
 */
export function formatValue(
  value: any,
  key: string,
  options: ConversionOptions = {}
): string {
  // Apply custom field transformation if available
  if (options.fieldTransformations?.[key]) {
    return options.fieldTransformations[key](value);
  }

  if (value === null || value === undefined) {
    return options.nullValue ?? '';
  }

  // Handle dates
  if (value instanceof Date) {
    if (options.dateFormat) {
      return formatDate(value, options.dateFormat);
    }
    return value.toISOString();
  }

  // Handle numbers
  if (typeof value === 'number') {
    return formatNumber(value, options.numberFormat);
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value.toString();
  }

  return String(value);
}

/**
 * Formats a number according to the specified options
 * @param value - The number to format
 * @param options - Number formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options?: ConversionOptions['numberFormat']
): string {
  if (!options) {
    return value.toString();
  }

  let result = value.toString();

  if (options.decimals !== undefined) {
    result = value.toFixed(options.decimals);
  }

  if (options.decimalSeparator && options.decimalSeparator !== '.') {
    result = result.replace('.', options.decimalSeparator);
  }

  if (options.thousandsSeparator) {
    const parts = result.split(options.decimalSeparator || '.');
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandsSeparator);
    }
    result = parts.join(options.decimalSeparator || '.');
  }

  return result;
}

/**
 * Formats a date according to the specified format string
 * @param date - The date to format
 * @param format - Format string (simple format tokens)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string): string {
  const tokens: Record<string, string> = {
    'YYYY': date.getFullYear().toString(),
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'DD': date.getDate().toString().padStart(2, '0'),
    'HH': date.getHours().toString().padStart(2, '0'),
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'ss': date.getSeconds().toString().padStart(2, '0'),
  };

  let result = format;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}

/**
 * Validates JSON input and provides helpful error messages
 * @param input - The input to validate
 * @returns Parsed JSON object or array
 * @throws ParseError if input is invalid
 */
export function validateAndParseJson(input: string | object | object[]): object | object[] {
  if (typeof input === 'object') {
    return input;
  }

  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Input must be a JSON object or array');
    }
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON syntax: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Gets all unique keys from an array of objects with custom ordering
 * @param objects - Array of objects
 * @param options - Conversion options
 * @returns Array of unique keys in specified order
 */
export function getAllKeys(
  objects: object[],
  options: ConversionOptions = {}
): string[] {
  const keySet = new Set<string>();

  for (const obj of objects) {
    const flattened = flattenObject(obj, options);
    for (const key of Object.keys(flattened)) {
      keySet.add(key);
    }
  }

  let keys = Array.from(keySet);

  // Apply custom column ordering if provided
  if (options.columnOrder) {
    const orderedKeys: string[] = [];
    const remainingKeys: string[] = [];

    // First, add keys in the specified order
    for (const orderKey of options.columnOrder) {
      if (keys.includes(orderKey)) {
        orderedKeys.push(orderKey);
      }
    }

    // Then add remaining keys
    for (const key of keys) {
      if (!options.columnOrder.includes(key)) {
        remainingKeys.push(key);
      }
    }

    // Sort remaining keys if requested (default: true)
    if (options.sortRemainingColumns !== false) {
      remainingKeys.sort();
    }

    keys = [...orderedKeys, ...remainingKeys];
  } else {
    // Default behavior: sort alphabetically
    keys.sort();
  }

  // Apply field mappings if provided
  if (options.fieldMappings) {
    return keys.map(key => options.fieldMappings![key] || key);
  }

  return keys;
}

/**
 * Validates conversion options and provides defaults
 * @param options - Options to validate
 * @returns Validated options with defaults
 */
export function validateOptions(options: ConversionOptions = {}): ConversionOptions {
  const validated: ConversionOptions = {
    delimiter: ',',
    includeHeaders: true,
    nullValue: '',
    arrayHandling: 'flatten',
    keySeparator: '.',
    maxDepth: Infinity,
    duplicateKeyHandling: 'suffix',
    ...options,
  };

  // Validate delimiter
  if (validated.delimiter && validated.delimiter.length !== 1) {
    if (!['\\t', 'tab'].includes(validated.delimiter)) {
      throw new Error('Delimiter must be a single character or "tab"');
    }
    validated.delimiter = '\t';
  }

  // Validate array handling
  const validArrayHandling = ['flatten', 'merge', 'separate-rows'];
  if (validated.arrayHandling && !validArrayHandling.includes(validated.arrayHandling)) {
    throw new Error(`Array handling must be one of: ${validArrayHandling.join(', ')}`);
  }

  return validated;
}
