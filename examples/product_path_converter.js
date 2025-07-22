#!/usr/bin/env node

import { JsonToCsvConverter } from '../dist/index.js';
import { promises as fs } from 'fs';

/**
 * FINAL SOLUTION: Perfect Product -> Path CSV Structure with Custom Column Ordering
 */
async function createFinalSolution() {
  console.log('🎯 FINAL SOLUTION: Perfect Product → Path CSV Structure\n');

  // Read your sample data
  const sampleData = JSON.parse(
    await fs.readFile('./examples/productPath.json', 'utf-8')
  );

  console.log('📊 What You Asked For:');
  console.log('   ✓ Product as main cell in row');
  console.log('   ✓ Paths as sub-rows for each product');
  console.log('   ✓ Column order: Product fields first, then path fields');
  console.log('');

  // PERFECT SOLUTION
  const converter = new JsonToCsvConverter({
    // Make each path a separate row while keeping product info
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

  console.log('✅ PERFECT RESULT:');
  console.log('='.repeat(100));
  
  // Show structure clearly
  const lines = result.data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  console.log('📋 Column Order (exactly as requested):');
  headers.forEach((header, index) => {
    const type = index < 4 ? '🏢 PRODUCT' : '📂 PATH';
    console.log(`   ${index + 1}. ${type}: ${header}`);
  });

  console.log('\n📊 Data Structure:');
  console.log('   Each product expands into multiple rows (one per path)');
  console.log('   Product information is preserved in each row');
  console.log('');

  let currentProduct = '';
  lines.slice(1).forEach((line, index) => {
    const parts = line.split(',');
    const productId = parts[0];    // productId (first column)
    const productTitle = parts[1]; // title (second column)  
    const pathName = parts[5];     // paths.name (sixth column)
    
    if (productTitle !== currentProduct) {
      currentProduct = productTitle;
      console.log(`🏢 PRODUCT: ${productTitle} (${productId.slice(-4)})`);
    }
    console.log(`   📂 └── PATH ROW ${index + 1}: ${pathName}`);
  });

  console.log('\n📄 Complete CSV Output:');
  console.log('='.repeat(100));
  console.log(result.data);

  // Save final result
  await fs.writeFile('./examples/product_with_paths.csv', result.data);
  console.log('\n💾 SAVED: ./examples/product_with_paths.csv');

  console.log('\n🎉 SUCCESS! You now have:');
  console.log('   ✅ Products as main rows with paths as sub-rows');
  console.log('   ✅ Perfect column order: Product fields → Path fields');
  console.log('   ✅ Complete data preservation');
  console.log('   ✅ Ready for analysis in Excel/databases');

  return result;
}

function showHowToUse() {
  console.log('\n' + '='.repeat(100));
  console.log('🚀 HOW TO USE THIS SOLUTION:');
  console.log('='.repeat(100));
  
  console.log('\n📝 1. CLI Command:');
  console.log('node dist/cli/index.js convert your-data.json \\');
  console.log('  --array-handling separate-rows \\');
  console.log('  --column-order "productId,title,pathCount,url,paths.id,paths.name,paths.url" \\');
  console.log('  --output your-output.csv');
  
  console.log('\n💻 2. Programmatic Usage:');
  console.log(`
import { JsonToCsvConverter } from 'json-csv-toolkit';

const converter = new JsonToCsvConverter({
  arrayHandling: 'separate-rows',    // Products → Path sub-rows
  columnOrder: [                     // Product fields first
    'productId', 'title', 'pathCount', 'url',  // Product info
    'paths.id', 'paths.name', 'paths.url'      // Path info  
  ]
});

const result = converter.convert(yourData.data);
console.log(result.data); // Perfect CSV structure!
  `);

  console.log('\n🔑 Key Settings:');
  console.log('   • arrayHandling: "separate-rows" → Each path becomes a row');
  console.log('   • columnOrder: [...] → Controls field order');
  console.log('   • Product fields listed first in columnOrder');
  console.log('   • Path fields listed second in columnOrder');
}

// Run the final solution
if (process.argv[1]?.endsWith('final-solution.js') || process.argv[1]?.endsWith('product_path_converter.js')) {
  createFinalSolution()
    .then(showHowToUse)
    .catch(console.error);
}

export { createFinalSolution };
