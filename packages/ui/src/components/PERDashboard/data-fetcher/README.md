# IFRC PER Data Fetcher

A Node.js-based ETL (Extract, Transform, Load) pipeline for fetching and processing data from the IFRC GO Platform API for the PER (Preparedness for Effective Response) Dashboard.

## Overview

This tool fetches data from multiple IFRC GO API endpoints, processes it into dashboard-ready formats, and provides validation utilities. It's designed to maintain data integrity while transforming complex assessment data into structures optimized for frontend visualization.

## Features

- Fetches data from multiple IFRC GO API endpoints
- Handles paginated responses automatically
- Processes and combines data from multiple sources
- Generates dashboard-optimized data structures
- Provides data validation and integrity checks
- Supports multilingual content (English/Spanish)
- Maintains geographical and assessment relationships

## File Structure

```
data-fetcher/
├── src/
│   ├── index.js              # Main entry point
│   ├── fetchData.js          # Handles API data fetching
│   ├── processData.js        # Data transformation logic
│   ├── checkData.js          # Data validation utilities
│   └── utils/
│       └── fetchPaginatedData.js  # Pagination handling utility
├── data/                     # Generated data files
│   ├── per-status.json           # Raw status data
│   ├── countries.json            # Raw country data
│   ├── prioritization.json       # Raw prioritization data
│   ├── per-assessments.json      # Raw assessment data
│   ├── map-data.json            # Processed map visualization data
│   ├── component-descriptions.json # Processed component metadata
│   ├── per-assessments-processed.json # Processed assessment data
│   └── per-dashboard-data.json   # Dashboard-specific data
├── package.json
└── README.md
```

## Installation

1. Ensure you have Node.js installed (v14 or higher recommended)
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

The tool provides several npm scripts for different operations:

```bash
# Run the complete data update pipeline
npm run update-data

# Individual steps:
npm run fetch    # Only fetch new data from API
npm run process  # Only process existing raw data
npm run check    # Run data validation checks
```

### API Endpoints

The tool fetches data from the following IFRC GO Platform endpoints:
- Process Status: `https://goadmin.ifrc.org/api/v2/public-per-process-status/`
- Countries: `https://goadmin.ifrc.org/api/v2/country/`
- Prioritization: `https://goadmin.ifrc.org/api/v2/public-per-prioritization/`
- Assessments: `https://goadmin.ifrc.org/api/v2/public-per-assessment/`

### Output Files

1. **map-data.json**
   - Combined geographical and assessment data
   - Includes country metadata and coordinates
   - Contains assessment phases and ratings

2. **component-descriptions.json**
   - Component metadata and descriptions
   - Area and component relationships
   - Multilingual content

3. **per-assessments-processed.json**
   - Processed assessment responses
   - Component ratings and considerations
   - Normalized data structure

4. **per-dashboard-data.json**
   - Dashboard-specific data structures
   - Grouped assessment data
   - Country assessment history

## Data Processing Pipeline

1. **Data Fetching** (`fetchData.js`)
   - Retrieves data from API endpoints
   - Handles pagination
   - Saves raw JSON files

2. **Data Processing** (`processData.js`)
   - Reads raw JSON files
   - Normalizes country/region information
   - Processes assessment responses
   - Generates output files

3. **Data Validation** (`checkData.js`)
   - Validates data integrity
   - Checks data completeness
   - Verifies relationships
   - Generates statistics

## Data Validation

The `checkData.js` utility provides several analysis functions:
- Assessment component response validation
- Status data and country coverage checks
- Geographical data completeness verification
- Dashboard data integrity validation

## Error Handling

- Comprehensive error catching and logging
- Detailed error messages for debugging
- Graceful failure handling
- Data integrity validation

## Dependencies

- `axios`: HTTP client for API requests
- `dotenv`: Environment configuration

## Contributing

When contributing to this tool:
1. Ensure all data transformations maintain data integrity
2. Add appropriate error handling
3. Update validation checks for new data structures
4. Document any new data processing steps

## License

ISC License
