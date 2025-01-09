const axios = require('axios');

async function fetchPaginatedData(baseUrl) {
  let allResults = [];
  let nextUrl = baseUrl;
  
  while (nextUrl) {
    try {
      console.log(`Fetching data from: ${nextUrl}`);
      const response = await axios.get(nextUrl);
      const { results, next, count } = response.data;
      
      if (!allResults.length) {
        console.log(`Total records to fetch: ${count}`);
      }
      
      allResults = [...allResults, ...results];
      console.log(`Fetched ${allResults.length} of ${count} records`);
      
      nextUrl = next;
    } catch (error) {
      console.error('Error fetching page:', error.message);
      throw error;
    }
  }
  
  return allResults;
}

module.exports = { fetchPaginatedData };
