#!/usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { JsonToCsvConverter } from '../converters/index.js';
import { CliOptions, ConversionOptions } from '../types/index.js';

const program = new Command();

/**
 * Main CLI application
 */
class JsonToCsvCli {
  private converter: JsonToCsvConverter;

  constructor() {
    this.converter = new JsonToCsvConverter();
  }

  /**
   * Sets up the CLI commands and options
   */
  public setupCommands(): void {
    program
      .name('json-to-csv')
      .description('Convert JSON data to CSV format with advanced options')
      .version('1.0.0');

    program
      .command('convert')
      .description('Convert JSON file to CSV')
      .argument('<input>', 'Input JSON file path or URL')
      .option('-o, --output <file>', 'Output CSV file path (default: stdout)')
      .option('-d, --delimiter <char>', 'CSV delimiter', ',')
      .option('--no-headers', 'Exclude header row from output')
      .option('--null-value <value>', 'Value to use for null/undefined fields', '')
      .option('--array-handling <mode>', 'How to handle arrays: flatten, merge, separate-rows', 'flatten')
      .option('--date-format <format>', 'Date format (e.g., YYYY-MM-DD)')
      .option('--max-depth <number>', 'Maximum depth for object flattening', parseInt)
      .option('--key-separator <char>', 'Separator for flattened object keys', '.')
      .option('--column-order <columns>', 'Comma-separated list of columns in desired order')
      .option('-v, --verbose', 'Enable verbose logging')
      .option('--validate', 'Validate JSON before processing')
      .action(async (input: string, options: CliOptions) => {
        await this.handleConvert(input, options);
      });

    program
      .command('batch')
      .description('Convert multiple JSON files to CSV')
      .argument('<pattern>', 'Glob pattern for input files (e.g., "data/*.json")')
      .option('-o, --output-dir <dir>', 'Output directory for CSV files', './output')
      .option('-d, --delimiter <char>', 'CSV delimiter', ',')
      .option('--no-headers', 'Exclude header row from output')
      .option('--null-value <value>', 'Value to use for null/undefined fields', '')
      .option('--array-handling <mode>', 'How to handle arrays: flatten, merge, separate-rows', 'flatten')
      .option('--date-format <format>', 'Date format (e.g., YYYY-MM-DD)')
      .option('--max-depth <number>', 'Maximum depth for object flattening', parseInt)
      .option('--key-separator <char>', 'Separator for flattened object keys', '.')
      .option('--column-order <columns>', 'Comma-separated list of columns in desired order')
      .option('-v, --verbose', 'Enable verbose logging')
      .option('--validate', 'Validate JSON before processing')
      .action(async (pattern: string, options: CliOptions) => {
        await this.handleBatch(pattern, options);
      });

    program
      .command('validate')
      .description('Validate JSON file without conversion')
      .argument('<input>', 'Input JSON file path')
      .option('-v, --verbose', 'Enable verbose logging')
      .action(async (input: string, options: CliOptions) => {
        await this.handleValidate(input, options);
      });
  }

  /**
   * Handles the convert command
   */
  private async handleConvert(input: string, options: CliOptions): Promise<void> {
    try {
      if (options.verbose) {
        console.log(`Processing: ${input}`);
      }

      // Read input data
      const jsonData = await this.readInput(input);

      if (options.validate) {
        this.validateJson(jsonData);
        if (options.verbose) {
          console.log('✓ JSON validation passed');
        }
      }

      // Convert options
      const conversionOptions = this.buildConversionOptions(options);
      this.converter = new JsonToCsvConverter(conversionOptions);

      // Perform conversion
      const result = this.converter.convert(jsonData);

      // Display warnings if verbose
      if (options.verbose && result.warnings.length > 0) {
        console.warn('Warnings:');
        result.warnings.forEach(warning => console.warn(`  • ${warning}`));
      }

      // Output result
      if (options.output) {
        await this.writeOutput(options.output, result.data);
        if (options.verbose) {
          console.log(`✓ Converted ${result.rowCount} rows with ${result.columnCount} columns`);
          console.log(`✓ Output written to: ${options.output}`);
        }
      } else {
        console.log(result.data);
      }

    } catch (error) {
      this.handleError(error, options.verbose);
    }
  }

  /**
   * Handles the batch command
   */
  private async handleBatch(pattern: string, options: CliOptions): Promise<void> {
    try {
      console.log(`Batch processing files matching: ${pattern}`);
      
      // This is a simplified version - in a real implementation you'd use a glob library
      console.log('Note: Batch processing requires a glob pattern matching library');
      console.log('For now, please process files individually using the convert command');
      
    } catch (error) {
      this.handleError(error, options.verbose);
    }
  }

  /**
   * Handles the validate command
   */
  private async handleValidate(input: string, options: CliOptions): Promise<void> {
    try {
      if (options.verbose) {
        console.log(`Validating: ${input}`);
      }

      const jsonData = await this.readInput(input);
      this.validateJson(jsonData);

      console.log('✓ JSON validation passed');
      
      if (options.verbose) {
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        console.log(`  • Contains ${dataArray.length} record(s)`);
        
        if (dataArray.length > 0) {
          const firstRecord = dataArray[0];
          const keys = Object.keys(firstRecord || {});
          console.log(`  • First record has ${keys.length} field(s): ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
      }

    } catch (error) {
      this.handleError(error, options.verbose);
    }
  }

  /**
   * Reads input from file or URL
   */
  private async readInput(input: string): Promise<string> {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      // Handle URL input
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from URL: ${response.statusText}`);
      }
      return await response.text();
    } else {
      // Handle file input
      const resolvedPath = resolve(input);
      return await fs.readFile(resolvedPath, 'utf-8');
    }
  }

  /**
   * Writes output to file
   */
  private async writeOutput(outputPath: string, data: string): Promise<void> {
    const resolvedPath = resolve(outputPath);
    const dir = dirname(resolvedPath);
    
    // Ensure output directory exists
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(resolvedPath, data, 'utf-8');
  }

  /**
   * Validates JSON data
   */
  private validateJson(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Input must be a JSON object or array');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON syntax: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Builds conversion options from CLI options
   */
  private buildConversionOptions(options: CliOptions): ConversionOptions {
    const conversionOptions: ConversionOptions = {
      delimiter: options.delimiter || ',',
      includeHeaders: true, // Default to true, CLI will have --no-headers to disable
      nullValue: options.nullValue || '',
      arrayHandling: options.arrayHandling || 'flatten',
      keySeparator: options.keySeparator || '.',
    };

    if (options.dateFormat) {
      conversionOptions.dateFormat = options.dateFormat;
    }

    if (options.maxDepth !== undefined) {
      conversionOptions.maxDepth = options.maxDepth;
    }

    // Parse column order from comma-separated string
    if (options.columnOrder) {
      conversionOptions.columnOrder = options.columnOrder
        .split(',')
        .map(col => col.trim())
        .filter(col => col.length > 0);
    }

    return conversionOptions;
  }

  /**
   * Handles errors with appropriate logging
   */
  private handleError(error: unknown, verbose = false): void {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (verbose) {
        console.error(error.stack);
      }
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }

  /**
   * Runs the CLI application
   */
  public run(): void {
    this.setupCommands();
    program.parse();
  }
}

// Run the CLI if this file is executed directly
if (process.argv[1]?.endsWith('cli/index.js') || process.argv[1]?.endsWith('cli/index.ts')) {
  const cli = new JsonToCsvCli();
  cli.run();
}
