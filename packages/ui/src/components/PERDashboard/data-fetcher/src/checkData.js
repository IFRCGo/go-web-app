/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Get target directory from command line arguments, default to '../data'
const targetDir = process.argv[2] || path.join(__dirname, '../data');

function analyzeAssessments(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { results } = data;

    const totalAssessments = results.length;
    let withComponentResponses = 0;
    let withoutComponentResponses = 0;

    results.forEach((assessment) => {
        const hasComponentResponses = assessment.area_responses.some(
            (area) => area.component_responses && area.component_responses.length > 0,
        );

        if (hasComponentResponses) {
            withComponentResponses += 1;
        } else {
            withoutComponentResponses += 1;
        }
    });

    console.log(`Total Assessment IDs: ${totalAssessments}`);
    console.log(`Assessments with component_responses: ${withComponentResponses}`);
    console.log(`Assessments without component_responses: ${withoutComponentResponses}`);
}

function analyzeStatus(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { results } = data;

    const totalAssessments = results.length;
    const uniqueCountries = new Set(results.map((assessment) => assessment.country)).size;

    console.log(`Total Assessment IDs in per-status.json: ${totalAssessments}`);
    console.log(`Unique Countries in per-status.json: ${uniqueCountries}`);
}

function analyzeMapData(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const uniqueCountries = new Set(data.map((item) => item.country_id)).size;
    const totalAssessments = data.length;

    console.log(`Total Assessments in map-data.json: ${totalAssessments}`);
    console.log(`Unique Countries in map-data.json: ${uniqueCountries}`);
}

function analyzeProcessedAssessments(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    //   const uniqueCountries = new Set(data.results.map(item => item.country_id)).size;
    const totalAssessments = data.results.length;

    console.log(`Total Assessments in per-assessments-processed.json: ${totalAssessments}`);
    //   console.log(`Unique Countries in per-assessments-processed.json: ${uniqueCountries}`);
}

function analyzeDashboardData(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { assessments } = data.assessments[0];

    const uniqueAssessments = new Set(assessments.map((a) => a.assessment_id)).size;
    const uniqueCountries = new Set(assessments.map((a) => a.country_id)).size;

    console.log(`Total Assessment IDs in per-dashboard-data.json: ${uniqueAssessments}`);
    console.log(`Unique Countries in per-dashboard-data.json: ${uniqueCountries}`);
}

// Replace paths with the actual paths to your JSON files
analyzeAssessments(path.join(targetDir, 'per-assessments.json'));
analyzeStatus(path.join(targetDir, 'per-status.json'));
analyzeMapData(path.join(targetDir, 'map-data.json'));
analyzeProcessedAssessments(path.join(targetDir, 'per-assessments-processed.json'));
analyzeDashboardData(path.join(targetDir, 'per-dashboard-data.json'));
