/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs').promises;
const path = require('path');
const { fetchPaginatedData } = require('./utils/fetchPaginatedData');

const PER_STATUS_URL = 'https://goadmin.ifrc.org/api/v2/public-per-process-status/';
const COUNTRIES_URL = 'https://goadmin.ifrc.org/api/v2/country/';
const PER_PRIORITIZATION_URL = 'https://goadmin.ifrc.org/api/v2/public-per-prioritization/';
const PER_ASSESSMENTS_URL = 'https://goadmin.ifrc.org/api/v2/public-per-assessment/';

async function fetchData() {
    console.log('Starting fetchData function...');
    try {
        console.log('Fetching PER status data...');
        const perStatusData = await fetchPaginatedData(PER_STATUS_URL);
        await fs.writeFile(
            path.join(__dirname, '../data/per-status.json'),
            JSON.stringify({ results: perStatusData }, null, 2),
        );
        console.log('PER status data saved');

        console.log('Fetching countries data...');
        const countriesData = await fetchPaginatedData(COUNTRIES_URL);
        await fs.writeFile(
            path.join(__dirname, '../data/countries.json'),
            JSON.stringify({ results: countriesData }, null, 2),
        );
        console.log('Countries data saved');

        console.log('Fetching prioritization data...');
        const prioritizationData = await fetchPaginatedData(PER_PRIORITIZATION_URL);
        await fs.writeFile(
            path.join(__dirname, '../data/prioritization.json'),
            JSON.stringify({ results: prioritizationData }, null, 2),
        );
        console.log('Component prioritizaton data saved');

        console.log('Fetching assessment data...');
        const assessmentData = await fetchPaginatedData(PER_ASSESSMENTS_URL);
        await fs.writeFile(
            path.join(__dirname, '../data/per-assessments.json'),
            JSON.stringify({ results: assessmentData }, null, 2),
        );
        console.log('Assessment data saved');

        console.log('All data fetched successfully');
    } catch (error) {
        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
            });
        }
        throw error;
    }
}

// Ensure the data directory exists
async function ensureDataDirectory() {
    console.log('Checking data directory...');
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
        console.log('Data directory exists');
    } catch {
        console.log('Creating data directory...');
        await fs.mkdir(dataDir, { recursive: true });
        console.log('Created data directory');
    }
}

// Execute the fetch process
console.log('Script starting...');
(async () => {
    try {
        await ensureDataDirectory();
        await fetchData();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        process.exit(1);
    }
})();

module.exports = { fetchData };
