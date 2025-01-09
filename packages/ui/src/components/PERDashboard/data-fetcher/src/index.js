require('dotenv').config();
const { processData } = require('./processData');

async function main() {
  try {
    // await fetchData();
    await processData();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
