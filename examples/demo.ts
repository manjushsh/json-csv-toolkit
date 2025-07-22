import { JsonToCsvConverter, jsonToCsv } from '../src/index.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Demonstration script showing various features of the JSON to CSV Toolkit
 */

console.log('🚀 JSON to CSV Toolkit Demo\n');

// Example 1: Basic conversion
console.log('📊 Example 1: Basic Array Conversion');
const basicData = [
  { name: 'John Doe', age: 30, city: 'New York', active: true },
  { name: 'Jane Smith', age: 25, city: 'Los Angeles', active: false },
  { name: 'Bob Johnson', age: 35, city: 'Chicago', active: true }
];

console.log('Input JSON:');
console.log(JSON.stringify(basicData, null, 2));
console.log('\nOutput CSV:');
console.log(jsonToCsv(basicData));
console.log('\n' + '='.repeat(80) + '\n');

// Example 2: Nested objects
console.log('🏗️ Example 2: Nested Objects (Flattening)');
const nestedData = [
  {
    id: 1,
    user: {
      name: 'Alice Wilson',
      contact: {
        email: 'alice@example.com',
        phone: '555-0123'
      }
    },
    preferences: {
      theme: 'dark',
      notifications: true
    }
  },
  {
    id: 2,
    user: {
      name: 'Charlie Brown',
      contact: {
        email: 'charlie@example.com',
        phone: '555-0456'
      }
    },
    preferences: {
      theme: 'light',
      notifications: false
    }
  }
];

console.log('Input JSON (nested):');
console.log(JSON.stringify(nestedData, null, 2));
console.log('\nOutput CSV (flattened):');
console.log(jsonToCsv(nestedData));
console.log('\n' + '='.repeat(80) + '\n');

// Example 3: Array handling - Merge
console.log('📋 Example 3: Array Handling - Merge Strategy');
const arrayData = [
  {
    name: 'Developer Team',
    skills: ['JavaScript', 'TypeScript', 'React'],
    projects: ['Website', 'Mobile App']
  },
  {
    name: 'Design Team',
    skills: ['Photoshop', 'Figma', 'UI/UX'],
    projects: ['Brand Identity', 'User Interface']
  }
];

console.log('Input JSON (with arrays):');
console.log(JSON.stringify(arrayData, null, 2));
console.log('\nOutput CSV (arrays merged):');
console.log(jsonToCsv(arrayData, { arrayHandling: 'merge' }));
console.log('\n' + '='.repeat(80) + '\n');

// Example 4: Custom options
console.log('⚙️ Example 4: Custom Configuration');
const converter = new JsonToCsvConverter({
  delimiter: ';',
  nullValue: 'N/A',
  dateFormat: 'YYYY-MM-DD',
  numberFormat: {
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  }
});

const customData = [
  {
    product: 'Laptop',
    price: 1299.99,
    inStock: true,
    lastUpdated: new Date('2023-12-01T10:30:00Z'),
    description: null
  },
  {
    product: 'Mouse',
    price: 29.95,
    inStock: false,
    lastUpdated: new Date('2023-11-15T14:20:00Z'),
    description: 'Wireless optical mouse'
  }
];

console.log('Input JSON:');
console.log(JSON.stringify(customData, null, 2));
console.log('\nOutput CSV (custom delimiter & formatting):');
const result = converter.convert(customData);
console.log(result.data);
console.log(`\nMetadata: ${result.rowCount} rows, ${result.columnCount} columns`);
if (result.warnings.length > 0) {
  console.log(`Warnings: ${result.warnings.join(', ')}`);
}
console.log('\n' + '='.repeat(80) + '\n');

// Example 5: Real-world API response
console.log('🌐 Example 5: Real-world API Response');
try {
  // Load the sample data from the examples folder
  const samplePath = resolve('./examples/sample-data.json');
  const sampleData = JSON.parse(readFileSync(samplePath, 'utf-8'));
  
  console.log('Sample API Response Structure:');
  console.log('data[].paths[] - Array of learning paths');
  
  // Convert with separate rows for array elements
  const apiConverter = new JsonToCsvConverter({
    arrayHandling: 'separate-rows'
  });
  
  const apiResult = apiConverter.convert(sampleData.data);
  console.log('\nConverted CSV (separate rows for paths):');
  console.log(apiResult.data);
  console.log(`\nResult: ${apiResult.rowCount} rows generated from ${sampleData.data.length} original records`);
  
} catch (error) {
  console.log('Note: Could not load sample data file. This is expected in the demo.');
}

console.log('\n🎉 Demo completed! Try running your own data through the toolkit.');

// Performance test
console.log('\n⚡ Performance Test: Large Dataset');
const largeData = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  data: {
    score: Math.random() * 100,
    active: Math.random() > 0.5,
    tags: [`tag${i % 5}`, `category${i % 3}`]
  }
}));

const startTime = Date.now();
const largeResult = jsonToCsv(largeData, { arrayHandling: 'flatten' });
const endTime = Date.now();

console.log(`Processed ${largeData.length} records in ${endTime - startTime}ms`);
console.log(`Throughput: ${Math.round(largeData.length / (endTime - startTime) * 1000)} records/second`);
console.log(`Output size: ${largeResult.length} characters`);
