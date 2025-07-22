import { describe, it, expect } from 'vitest';
import { JsonToCsvConverter, jsonToCsv } from '../src/converters/index.js';
import { flattenObject, escapeCsvValue, formatValue } from '../src/utils/index.js';

describe('JsonToCsvConverter', () => {
  describe('basic conversion', () => {
    it('should convert simple object to CSV', () => {
      const input = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' }
      ];

      const result = jsonToCsv(input);
      const lines = result.split('\n');

      expect(lines[0]).toBe('age,city,name');
      expect(lines[1]).toBe('30,New York,John');
      expect(lines[2]).toBe('25,Los Angeles,Jane');
    });

    it('should handle empty array', () => {
      const input: any[] = [];
      const result = jsonToCsv(input);
      expect(result).toBe(',');
    });

    it('should handle single object', () => {
      const input = { name: 'John', age: 30 };
      const result = jsonToCsv(input);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('age,name');
      expect(lines[1]).toBe('30,John');
    });
  });

  describe('nested objects', () => {
    it('should flatten nested objects with dot notation', () => {
      const input = [
        {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'New York'
          }
        }
      ];

      const result = jsonToCsv(input);
      const lines = result.split('\n');

      expect(lines[0]).toBe('address.city,address.street,name');
      expect(lines[1]).toBe('New York,123 Main St,John');
    });

    it('should handle deeply nested objects', () => {
      const input = [
        {
          user: {
            profile: {
              personal: {
                name: 'John'
              }
            }
          }
        }
      ];

      const result = jsonToCsv(input);
      expect(result).toContain('user.profile.personal.name');
      expect(result).toContain('John');
    });
  });

  describe('array handling', () => {
    it('should flatten arrays by default', () => {
      const input = [
        {
          name: 'John',
          hobbies: ['reading', 'swimming']
        }
      ];

      const result = jsonToCsv(input);
      expect(result).toContain('hobbies.0');
      expect(result).toContain('hobbies.1');
      expect(result).toContain('reading');
      expect(result).toContain('swimming');
    });

    it('should merge arrays when specified', () => {
      const input = [
        {
          name: 'John',
          hobbies: ['reading', 'swimming']
        }
      ];

      const result = jsonToCsv(input, { arrayHandling: 'merge' });
      expect(result).toContain('reading, swimming');
    });

    it('should create separate rows for arrays when specified', () => {
      const converter = new JsonToCsvConverter({ arrayHandling: 'separate-rows' });
      const input = [
        {
          name: 'John',
          hobbies: ['reading', 'swimming']
        }
      ];

      const result = converter.convert(input);
      expect(result.rowCount).toBe(2); // Two rows for two hobbies
    });
  });

  describe('data types', () => {
    it('should handle various data types', () => {
      const input = [
        {
          string: 'hello',
          number: 42,
          boolean: true,
          null_value: null,
          undefined_value: undefined,
          date: new Date('2023-01-01T00:00:00Z')
        }
      ];

      const result = jsonToCsv(input);
      expect(result).toContain('hello');
      expect(result).toContain('42');
      expect(result).toContain('true');
      expect(result).toContain('2023-01-01T00:00:00.000Z');
    });
  });

  describe('options', () => {
    it('should use custom delimiter', () => {
      const input = [{ a: 1, b: 2 }];
      const result = jsonToCsv(input, { delimiter: ';' });
      
      expect(result).toContain('a;b');
      expect(result).toContain('1;2');
    });

    it('should exclude headers when specified', () => {
      const input = [{ name: 'John', age: 30 }];
      const result = jsonToCsv(input, { includeHeaders: false });
      
      expect(result).not.toContain('name');
      expect(result).not.toContain('age');
      expect(result).toBe('30,John');
    });

    it('should use custom null value', () => {
      const input = [{ name: 'John', value: null }];
      const result = jsonToCsv(input, { nullValue: 'N/A' });
      
      expect(result).toContain('N/A');
    });
  });
});

describe('Utility Functions', () => {
  describe('flattenObject', () => {
    it('should flatten simple nested object', () => {
      const input = {
        name: 'John',
        address: {
          city: 'New York'
        }
      };

      const result = flattenObject(input);
      expect(result).toEqual({
        name: 'John',
        'address.city': 'New York'
      });
    });

    it('should handle custom key separator', () => {
      const input = { user: { name: 'John' } };
      const result = flattenObject(input, { keySeparator: '_' });
      
      expect(result).toEqual({
        'user_name': 'John'
      });
    });
  });

  describe('escapeCsvValue', () => {
    it('should escape values containing delimiter', () => {
      expect(escapeCsvValue('Hello, World')).toBe('"Hello, World"');
    });

    it('should escape values containing quotes', () => {
      expect(escapeCsvValue('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    it('should not escape simple values', () => {
      expect(escapeCsvValue('Hello')).toBe('Hello');
    });

    it('should escape values containing newlines', () => {
      expect(escapeCsvValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    });
  });

  describe('formatValue', () => {
    it('should format dates', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const result = formatValue(date, 'date');
      expect(result).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should format numbers', () => {
      expect(formatValue(42.5, 'number')).toBe('42.5');
    });

    it('should format booleans', () => {
      expect(formatValue(true, 'boolean')).toBe('true');
      expect(formatValue(false, 'boolean')).toBe('false');
    });

    it('should handle null values', () => {
      expect(formatValue(null, 'field')).toBe('');
      expect(formatValue(null, 'field', { nullValue: 'NULL' })).toBe('NULL');
    });
  });
});
