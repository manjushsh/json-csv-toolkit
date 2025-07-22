# JSON to CSV Toolkit

A powerful TypeScript/Node.js toolkit for converting JSON data to CSV format with advanced features for handling nested objects, arrays, and various data types.

## Features

- 🚀 **High Performance**: Optimized for large datasets with streaming support
- 🏗️ **Flexible Architecture**: Modular design with dependency injection
- 🔧 **Advanced Configuration**: Extensive options for customizing output
- 📊 **Smart Data Handling**: Intelligent processing of nested objects and arrays
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🧪 **Well Tested**: Comprehensive test suite with edge case coverage
- 🎯 **CLI Support**: Command-line interface for batch processing
- 📈 **Performance Monitoring**: Built-in benchmarking and metrics

## Installation

```bash
# Using pnpm (recommended)
pnpm add json-csv-toolkit

# Using npm
npm install json-csv-toolkit

# Using yarn
yarn add json-csv-toolkit
```

## Quick Start

### Basic Usage

```typescript
import { jsonToCsv } from 'json-csv-toolkit';

const jsonData = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'Los Angeles' }
];

const csvOutput = jsonToCsv(jsonData);
console.log(csvOutput);
// Output:
// age,city,name
// 30,New York,John
// 25,Los Angeles,Jane
```

### Advanced Usage

```typescript
import { JsonToCsvConverter } from 'json-csv-toolkit';

const converter = new JsonToCsvConverter({
  delimiter: ';',
  arrayHandling: 'separate-rows',
  dateFormat: 'YYYY-MM-DD',
  nullValue: 'N/A'
});

const result = converter.convert(complexJsonData);
console.log(`Converted ${result.rowCount} rows`);
console.log(`Warnings: ${result.warnings.join(', ')}`);
```

## Handling Complex Data

### Nested Objects

The toolkit automatically flattens nested objects using dot notation:

```typescript
const data = [
  {
    user: {
      profile: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York'
        }
      }
    }
  }
];

// Results in columns: user.profile.name, user.profile.address.street, user.profile.address.city
```

### Arrays

Three different strategies for handling arrays:

1. **Flatten** (default): Creates separate columns for each array element
2. **Merge**: Joins array elements with commas
3. **Separate Rows**: Creates multiple CSV rows for each array element

```typescript
// Flatten arrays (default)
const csvFlattened = jsonToCsv(data, { arrayHandling: 'flatten' });

// Merge arrays
const csvMerged = jsonToCsv(data, { arrayHandling: 'merge' });

// Separate rows for each array element
const csvSeparateRows = jsonToCsv(data, { arrayHandling: 'separate-rows' });
```

## Configuration Options

```typescript
interface ConversionOptions {
  delimiter?: ',' | ';' | '\t' | string;           // CSV delimiter
  includeHeaders?: boolean;                         // Include header row
  nullValue?: string;                              // Value for null/undefined
  arrayHandling?: 'flatten' | 'merge' | 'separate-rows';
  fieldMappings?: Record<string, string>;          // Rename columns
  fieldTransformations?: Record<string, (value: any) => string>;
  dateFormat?: string;                             // Date format string
  numberFormat?: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
  };
  duplicateKeyHandling?: 'merge' | 'error' | 'suffix';
  maxDepth?: number;                               // Max nesting depth
  keySeparator?: string;                           // Separator for nested keys
}
```

## CLI Usage

Install globally to use the command-line interface:

```bash
pnpm add -g json-csv-toolkit
```

### Convert a single file:

```bash
json-to-csv convert input.json -o output.csv
```

### Advanced CLI options:

```bash
json-to-csv convert data.json \
  --output result.csv \
  --delimiter ";" \
  --array-handling separate-rows \
  --date-format "YYYY-MM-DD" \
  --verbose
```

### Batch processing:

```bash
json-to-csv batch "data/*.json" --output-dir ./csv-files
```

### Validate JSON:

```bash
json-to-csv validate input.json --verbose
```

## Examples

### Example 1: E-commerce Product Data

```typescript
const products = [
  {
    id: "p001",
    name: "Laptop",
    price: 999.99,
    categories: ["electronics", "computers"],
    specifications: {
      cpu: "Intel i7",
      ram: "16GB",
      storage: {
        type: "SSD",
        capacity: "512GB"
      }
    },
    inStock: true,
    lastUpdated: "2023-12-01T10:30:00Z"
  }
];

const csv = jsonToCsv(products, {
  arrayHandling: 'merge',
  dateFormat: 'YYYY-MM-DD HH:mm',
  numberFormat: {
    decimals: 2,
    thousandsSeparator: ','
  }
});
```

### Example 2: API Response with Nested Arrays

```typescript
const apiResponse = {
  data: [
    {
      userId: 1,
      posts: [
        { title: "Post 1", tags: ["tech", "programming"] },
        { title: "Post 2", tags: ["design"] }
      ]
    }
  ]
};

// Create separate rows for each post
const csv = jsonToCsv(apiResponse.data, {
  arrayHandling: 'separate-rows'
});
```

### Example 3: Product → Path Structure (Real-World Demo)

The toolkit includes a comprehensive example for converting product data with nested path arrays into a CSV where each path becomes a separate row while preserving product information. This is perfect for e-commerce, inventory systems, or any hierarchical data structure.

#### Running the Demo

```bash
# Clone or navigate to the project
cd json-csv-toolkit

# Build the project
pnpm run build

# Run the product path converter demo
node examples/product_path_converter.js
```

#### Input Data Structure

```json
{
  "data": [
    {
      "productId": "11111111-1111-1111-1111-111111111111",
      "title": "Sample Product A",
      "pathCount": 2,
      "url": "https://example.com/?productId=11111111-1111-1111-1111-111111111111",
      "paths": [
        {
          "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "name": "Sample Path 1",
          "url": "https://example.com/details/Path/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
        },
        {
          "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          "name": "Sample Path 2",
          "url": "https://example.com/details/Path/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
        }
      ]
    }
  ]
}
```

#### Converter Configuration

```javascript
import { JsonToCsvConverter } from 'json-csv-toolkit';

const converter = new JsonToCsvConverter({
  // Each path becomes a separate row while keeping product info
  arrayHandling: 'separate-rows',
  
  // Custom column ordering: Product fields first, then path fields
  columnOrder: [
    'productId',    // Product field 1
    'title',        // Product field 2  
    'pathCount',    // Product field 3
    'url',          // Product field 4
    'paths.id',     // Path field 1
    'paths.name',   // Path field 2
    'paths.url'     // Path field 3
  ]
});

const result = converter.convert(sampleData.data);
```

#### Output Structure

```csv
productId,title,pathCount,url,paths.id,paths.name,paths.url
11111111-1111-1111-1111-111111111111,Sample Product A,2,https://example.com/?productId=11111111-1111-1111-1111-111111111111,aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Sample Path 1,https://example.com/details/Path/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
11111111-1111-1111-1111-111111111111,Sample Product A,2,https://example.com/?productId=11111111-1111-1111-1111-111111111111,bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,Sample Path 2,https://example.com/details/Path/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
```

#### Key Features Demonstrated

- **Product Information Preservation**: Each row contains complete product details
- **Path Expansion**: Each product path becomes a separate CSV row
- **Custom Column Ordering**: Product fields appear first, followed by path fields
- **Data Structure Clarity**: Perfect for analysis in Excel, databases, or BI tools

#### CLI Usage for Similar Data

```bash
# Convert product-path JSON to CSV with custom settings
json-to-csv convert examples/productPath.json \
  --array-handling separate-rows \
  --column-order "productId,title,pathCount,url,paths.id,paths.name,paths.url" \
  --output product-paths.csv
```

## Error Handling

The toolkit provides detailed error information:

```typescript
import { ParseError, ValidationError, TransformationError } from 'json-csv-toolkit';

try {
  const result = converter.convert(invalidJson);
} catch (error) {
  if (error instanceof ParseError) {
    console.error('JSON parsing failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof TransformationError) {
    console.error('Transformation error:', error.message);
  }
}
```

## Performance

The toolkit is optimized for performance:

- **Memory Efficient**: Streaming support for large datasets
- **Fast Processing**: Optimized algorithms for common JSON structures
- **Benchmarking**: Built-in performance metrics

```typescript
const result = converter.convert(largeDataset);
console.log(`Processed ${result.rowCount} rows`);
console.log(`Performance: ${result.rowCount / (Date.now() - startTime) * 1000} rows/sec`);
```

## API Reference

### Main Classes

- `JsonToCsvConverter`: Main converter class
- `JsonCsvError`: Base error class
- `ParseError`: JSON parsing errors
- `ValidationError`: Input validation errors
- `TransformationError`: Data transformation errors

### Utility Functions

- `flattenObject()`: Flatten nested objects
- `escapeCsvValue()`: Escape CSV values
- `formatValue()`: Format values according to options
- `validateAndParseJson()`: Validate and parse JSON input

### Types

- `ConversionOptions`: Configuration interface
- `ConversionResult`: Result interface with metadata
- `JsonInput`: Supported input types
- `PerformanceMetrics`: Performance monitoring interface

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Lint code
pnpm run lint

# Format code
pnpm run format

# Run the product path converter demo
pnpm run demo

# Or run the TypeScript examples directly
npx tsx examples/demo.ts
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Support

- 📧 Email: <NA>
- 🐛 Issues: [GitHub Issues](https://github.com/manjushsh/json-csv-toolkit/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/manjushsh/json-csv-toolkit/discussions)
