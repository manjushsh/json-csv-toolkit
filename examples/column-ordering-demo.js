#!/usr/bin/env node

import { JsonToCsvConverter } from '../dist/index.js';
import { promises as fs } from 'fs';

/**
 * Demonstration of proper column ordering: Product fields first, then Path fields
 */
async function demonstrateProperColumnOrdering() {
  console.log('🎯 Proper Column Ordering: Product → Path Fields\n');

  // Read the sample data
  const sampleData = JSON.parse(
    await fs.readFile('./examples/sample-data.json', 'utf-8')
  );

  console.log('📊 Desired Column Order:');
  console.log('   Product Fields: productId, title, pathCount, url');
  console.log('   Path Fields: paths.id, paths.name, paths.url');
  console.log('');

  // Convert with proper column ordering
  const converter = new JsonToCsvConverter({
    arrayHandling: 'separate-rows',
    columnOrder: [
      // Product fields first
      'productId',
      'title', 
      'pathCount',
      'url',
      // Path fields second
      'paths.id',
      'paths.name',
      'paths.url'
    ],
    delimiter: ','
  });

  const result = converter.convert(sampleData.data);

  console.log('✅ Generated CSV with Proper Column Order:');
  console.log('='.repeat(80));
  
  // Show the result with nice formatting
  const lines = result.data.split('\n').filter(line => line.trim());
  
  console.log('📋 Headers (in proper order):');
  const headers = lines[0].split(',');
  headers.forEach((header, index) => {
    const isProductField = ['productId', 'title', 'pathCount', 'url'].includes(header);
    const prefix = isProductField ? '🏢 Product:' : '📂 Path:   ';
    console.log(`   ${index + 1}. ${prefix} ${header}`);
  });

  console.log('\n📊 Data Rows:');
  lines.slice(1).forEach((line, index) => {
    const parts = line.split(',');
    const productTitle = parts[1]; // title column (2nd column)
    const pathName = parts[5]; // paths.name column (6th column)
    console.log(`   Row ${index + 1}: ${productTitle} → ${pathName}`);
  });

  console.log('\n📄 Complete CSV Output:');
  console.log('='.repeat(80));
  console.log(result.data);

  // Save the properly ordered CSV
  await fs.writeFile('./examples/properly-ordered-output.csv', result.data);
  console.log('\n💾 Saved to: ./examples/properly-ordered-output.csv');

  console.log('\n🎯 Perfect! Product fields come first, then path fields!');
  
  return result;
}

// Show how to use this programmatically
function showUsageExample() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 How to Use Column Ordering in Your Code:');
  console.log('='.repeat(80));
  
  const exampleCode = `
import { JsonToCsvConverter } from 'json-csv-toolkit';

const converter = new JsonToCsvConverter({
  arrayHandling: 'separate-rows',
  columnOrder: [
    // Product fields first
    'productId',
    'title', 
    'pathCount',
    'url',
    // Path fields second  
    'paths.id',
    'paths.name',
    'paths.url'
  ]
});

const result = converter.convert(yourJsonData.data);
console.log(result.data); // CSV with perfect column ordering!
  `;
  
  console.log(exampleCode);
  
  console.log('\n🚀 Key Features:');
  console.log('   ✓ columnOrder: Array of field names in desired order');
  console.log('   ✓ Product fields listed first');
  console.log('   ✓ Path fields listed second');
  console.log('   ✓ Remaining fields (if any) sorted alphabetically');
}

// Run demonstration
if (process.argv[1]?.endsWith('column-ordering-demo.js')) {
  demonstrateProperColumnOrdering()
    .then(showUsageExample)
    .catch(console.error);
}

export { demonstrateProperColumnOrdering };
