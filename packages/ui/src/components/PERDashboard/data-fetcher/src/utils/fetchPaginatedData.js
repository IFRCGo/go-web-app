/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const axios = require('axios');

async function fetchPaginatedData(baseUrl) {
    let allResults = [];
    let nextUrl = baseUrl;

    console.log('Starting data fetch from:', baseUrl);

    while (nextUrl) {
        try {
            console.log(`Making request to: ${nextUrl}`);
            // eslint-disable-next-line no-await-in-loop
            const response = await axios.get(nextUrl, {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'IFRC-Data-Fetcher',
                },
            });

            console.log('Response status:', response.status);

            if (!response.data) {
                console.error('No data in response');
                break;
            }

            const { results, next, count } = response.data;

            if (!results) {
                console.error('No results in response data:', response.data);
                break;
            }

            if (!allResults.length) {
                console.log(`Total records to fetch: ${count}`);
            }

            allResults = [...allResults, ...results];
            console.log(`Fetched ${allResults.length} of ${count} records`);

            nextUrl = next;
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                } : 'No response',
                config: error.config ? {
                    url: error.config.url,
                    method: error.config.method,
                    headers: error.config.headers,
                } : 'No config',
            });
            throw error;
        }
    }

    return allResults;
}

module.exports = { fetchPaginatedData };
