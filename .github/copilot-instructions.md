<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# JSON to CSV Toolkit - Copilot Instructions

## Project Overview
This is a TypeScript/Node.js project for converting JSON data to CSV format. The tool should handle various JSON structures including nested objects, arrays, and different data types.

## Guidelines for Code Generation

### Core Functionality
- **Primary Purpose**: Convert JSON data to CSV format with flexibility for different JSON structures
- **Input Sources**: JSON files, JSON strings, API responses
- **Output Formats**: CSV files, CSV strings, streaming output
- **Error Handling**: Graceful handling of malformed JSON, missing fields, and type mismatches

### Architecture Patterns
- Use TypeScript for type safety and better developer experience
- Follow functional programming principles where applicable
- Implement modular design with clear separation of concerns
- Use dependency injection for testability
- Use pnpm as package manager for efficient dependency management
- Use Node 22 or later for modern JavaScript features
- Use less third-party libraries to keep the project lightweight and maintainable

### Code Style Preferences
- Use meaningful variable and function names that describe the data transformation
- Prefer explicit types over `any`
- Include comprehensive JSDoc comments for public APIs
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes)

### JSON Processing Guidelines
- Handle nested objects by flattening with dot notation (e.g., `user.address.city`)
- Process arrays by either creating multiple rows or concatenating values
- Row merging for arrays should be used when appropriate
- Support optional fields and missing data without breaking the conversion
- Allow configuration for how to handle null or undefined values (e.g., empty strings, default values)
- Support for custom date formats and number formatting
- Provide options for handling duplicate keys (e.g., merging values, throwing errors)
- Preserve data types when possible (numbers, booleans, dates)
- Provide options for custom field mappings and transformations

### CSV Output Guidelines
- Use standard CSV format with proper escaping
- Support custom delimiters (comma, semicolon, tab)
- Include header row by default with option to disable
- Handle special characters and multi-line values properly

### Testing Approach
- Write unit tests for core conversion functions
- Include integration tests with sample JSON/CSV data
- Test edge cases: empty objects, null values, circular references
- Performance tests for large datasets

### Error Handling
- Provide clear error messages with context
- Use custom error types for different failure scenarios
- Log errors appropriately without exposing sensitive data
- Offer recovery strategies where possible

### CLI Interface
- Use commander.js for command-line interface
- Support batch processing of multiple files
- Provide progress indicators for large operations
- Include help text and usage examples

### Performance Considerations
- Stream processing for large files to manage memory usage
- Optimize for common JSON structures
- Provide options for parallel processing when applicable
- Include benchmarking utilities

## File Organization
- `/src` - Main source code
- `/src/types` - TypeScript type definitions
- `/src/converters` - Core conversion logic
- `/src/cli` - Command-line interface
- `/src/utils` - Utility functions
- `/tests` - Test files
- `/examples` - Sample JSON/CSV files

## Dependencies to Consider
- `csv-writer` - For CSV output generation
- `csv-parser` - For CSV input parsing (if needed for reverse conversion)
- `commander` - For CLI interface
- `yargs` - Alternative CLI framework
- `fast-csv` - High-performance CSV processing
- `lodash` - Utility functions for data manipulation

Please generate code that follows these guidelines and maintains consistency with the established patterns.
