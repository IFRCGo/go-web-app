/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');

// Get target directory from command line arguments, default to '../data'
const targetDir = process.argv[2] || path.join(__dirname, '../data');

async function ensureDirectoryExists() {
    try {
        await fs.access(targetDir);
    } catch {
        await fs.mkdir(targetDir, { recursive: true });
    }
}

async function processData() {
    try {
        console.log('\n=== Starting Data Processing ===');
        console.log('Target directory:', targetDir);

        // Ensure the directory exists before proceeding
        await ensureDirectoryExists();

        // Update last update timestamp
        console.log('\nUpdating timestamp...');
        await fs.writeFile(
            path.join(targetDir, 'last-update.json'),
            JSON.stringify({ lastUpdate: new Date().toISOString() }, null, 2),
        );

        // Read the downloaded files
        console.log('\nReading input files...');
        console.log('- Reading per-status.json');
        const perStatusData = JSON.parse(
            await fs.readFile(path.join(targetDir, 'per-status.json'), 'utf8'),
        );
        console.log('- Reading countries.json');
        const countriesData = JSON.parse(
            await fs.readFile(path.join(targetDir, 'countries.json'), 'utf8'),
        );
        console.log('- Reading prioritization.json');
        const prioritizationData = JSON.parse(
            await fs.readFile(path.join(targetDir, 'prioritization.json'), 'utf8'),
        );
        console.log('- Reading per-assessments.json');
        const assessments = JSON.parse(
            await fs.readFile(path.join(targetDir, 'per-assessments.json'), 'utf8'),
        );

        console.log('\nInput Data Summary:');
        console.log('- Total input assessments:', assessments.results.length);
        console.log('- Total status assessments:', perStatusData.results.length);
        console.log('- Total countries:', countriesData.results.length);
        console.log('- Total prioritization items:', prioritizationData.results.length);

        // Create a lookup map for countries
        const countryMap = new Map(
            countriesData.results.map((country) => [
                country.iso3,
                {
                    centroid: country.centroid,
                    iso3: country.iso3,
                    region: country.region,
                    name: country.name,
                },
            ]),
        );

        // Create a components description lookup
        const componentDescriptions = {};
        prioritizationData.results.forEach((item) => {
            item.prioritized_action_responses.forEach((response) => {
                const component = response.component_details;
                componentDescriptions[component.id] = {
                    componentTitle: component.title,
                    areaTitle: component.area.title,
                    description: component.description,
                };
            });
        });

        // Create a simplified prioritization lookup
        const prioritizationMap = new Map(
            prioritizationData.results.map((item) => [
                item.overview,
                {
                    components: item.prioritized_action_responses.map((response) => ({
                        componentId: response.component,
                        componentTitle: response.component_details.title,
                        areaTitle: response.component_details.area.title,
                    })),
                },
            ]),
        );

        // Map region_id to region_name
        const regionIdToNameMap = {
            0: 'Africa',
            1: 'Americas',
            2: 'Asia Pacific',
            3: 'Europe',
            4: 'MENA',
        };

        // Add area names mapping
        const areaNames = {
            1: 'Policy Strategy and Standards',
            2: 'Analysis and planning',
            3: 'Operational capacity',
            4: 'Coordination',
            5: 'Operations support',
        };

        // List of affirmative words in English and Spanish
        const affirmativeWords = ['yes', 'sí', 'si']; // Include 'si' without accent

        // Helper function to check for affirmative words
        const containsAffirmativeWord = (text) => {
            if (!text || typeof text !== 'string') {
                return false;
            }
            // Normalize text to lower case and remove accents for comparison
            const normalizedText = text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            return affirmativeWords.some((word) => normalizedText.includes(word));
        };

        // Process the assessments data
        const processedAssessments = assessments.results.map((result) => ({
            id: result.id,
            area_responses: result.area_responses.map((areaResponse) => ({
                id: areaResponse.id,
                component_responses: areaResponse.component_responses.map(
                    (componentResponse) => {
                        const simplifiedComponentDetails = {
                            id: componentResponse.component_details?.id ?? null,
                            // eslint-disable-next-line max-len
                            component_num: componentResponse.component_details?.component_num ?? null,
                            area: componentResponse.component_details?.area ?? null,
                            title: componentResponse.component_details?.title ?? null,
                            description: componentResponse.component_details?.description ?? null,
                        };

                        // Simplify rating_details
                        const simplifiedRatingDetails = {
                            id: componentResponse.rating_details?.id ?? null,
                            value: componentResponse.rating_details?.value ?? null,
                            title: componentResponse.rating_details?.title ?? null,
                        };

                        // Extract the text fields
                        const {
                            urban_considerations,
                            epi_considerations,
                            climate_environmental_considerations,
                        } = componentResponse;

                        // Create simplified boolean fields
                        // eslint-disable-next-line max-len
                        const urbanConsiderationsSimplified = containsAffirmativeWord(urban_considerations);
                        // eslint-disable-next-line max-len
                        const epiConsiderationsSimplified = containsAffirmativeWord(epi_considerations);
                        // eslint-disable-next-line max-len
                        const climateEnvironmentalConsiderationsSimplified = containsAffirmativeWord(climate_environmental_considerations);

                        return {
                            id: componentResponse.id,
                            component: componentResponse.component,
                            rating: componentResponse.rating,
                            rating_details: simplifiedRatingDetails,
                            component_details: simplifiedComponentDetails,
                            urban_considerations,
                            epi_considerations,
                            climate_environmental_considerations,
                            urban_considerations_simplified: urbanConsiderationsSimplified,
                            epi_considerations_simplified: epiConsiderationsSimplified,
                            climate_environmental_considerations_simplified:
                                climateEnvironmentalConsiderationsSimplified,
                            notes: componentResponse.notes,
                        };
                    },
                ),
            })),
        }));

        // Add dashboard assessments processing
        const dashboardAssessments = assessments.results.map((assessment) => {
            const components = [];

            assessment.area_responses.forEach((areaResponse) => {
                const areaComponents = areaResponse.component_responses.map(
                    (componentResponse) => ({
                        component_id: componentResponse.component,
                        component_name: componentResponse.component_details?.title || '',
                        component_num:
                            componentResponse.component_details?.component_num || null,
                        area_id: componentResponse.component_details?.area || null,
                        area_name:
                            areaNames[componentResponse.component_details?.area] || '',
                        rating_value: componentResponse.rating_details?.value || 0,
                        rating_title: componentResponse.rating_details?.title || '',
                    }),
                );
                components.push(...areaComponents);
            });

            return {
                assessment_id: assessment.id,
                components,
            };
        });

        // Create a map from assessment ID to considerations booleans
        const assessmentConsiderationsMap = new Map();

        processedAssessments.forEach((assessment) => {
            let epi_considerations = false;
            let climate_environmental_considerations = false;
            let urban_considerations = false;

            assessment.area_responses.forEach((areaResponse) => {
                areaResponse.component_responses.forEach((componentResponse) => {
                    if (componentResponse.epi_considerations_simplified) {
                        epi_considerations = true;
                    }
                    if (
                        componentResponse.climate_environmental_considerations_simplified
                    ) {
                        climate_environmental_considerations = true;
                    }
                    if (componentResponse.urban_considerations_simplified) {
                        urban_considerations = true;
                    }
                });
            });

            assessmentConsiderationsMap.set(assessment.id, {
                epi_considerations,
                climate_environmental_considerations,
                urban_considerations,
            });
        });

        // Process and join the data based on iso3 code and include prioritization data
        const joinedData = perStatusData.results.map((status) => {
            const countryIso3 = status.country_details?.iso3;
            const countryData = countryMap.get(countryIso3);

            const regionId = countryData?.region || status.country_details?.region;
            const prioritization = prioritizationMap.get(status.id) || {
                components: [],
            };
            const dashboardAssessment = dashboardAssessments.find(
                (a) => a.assessment_id === status.assessment,
            ) || { components: [] };

            // Get considerations from the map
            const considerations = assessmentConsiderationsMap.get(
                status.assessment,
            ) || {
                epi_considerations: false,
                climate_environmental_considerations: false,
                urban_considerations: false,
            };

            let phaseDisplay = status.phase_display;
            if (status.phase_display === 'Action And Accountability') {
                phaseDisplay = 'Action & accountability';
            } else if (status.phase_display === 'WorkPlan') {
                phaseDisplay = 'Workplan';
            }

            return {
                id: status.id,
                assessment_number: status.assessment_number,
                date_of_assessment: status.date_of_assessment,
                country_id: status.country,
                country_name: status.country_details?.name || countryData?.name || null,
                phase: status.phase,
                phase_display: phaseDisplay,
                type_of_assessment: status.type_of_assessment,
                type_of_assessment_name:
                    status.type_of_assessment_details?.name || null,
                country_iso3: status.country_details?.iso3 || countryData?.iso3,
                region_id: regionId,
                region_name: regionIdToNameMap[regionId] || null,
                latitude: countryData?.centroid?.coordinates[1] || null,
                longitude: countryData?.centroid?.coordinates[0] || null,
                updated_at: status.updated_at,
                prioritized_components: prioritization.components,
                epi_considerations: considerations.epi_considerations,
                climate_environmental_considerations:
                    considerations.climate_environmental_considerations,
                urban_considerations: considerations.urban_considerations,
                components: dashboardAssessment.components,
            };
        });

        // Fix: When creating grouped data, don't filter out assessments without components
        const grouped = [];
        joinedData.forEach((assessment) => {
            // Initialize empty components array if null
            const components = assessment.components || [];

            // Always create at least one group entry even if no components
            if (components.length === 0) {
                const emptyAssessment = {
                    assessment_id: assessment.id,
                    assessment_number: assessment.assessment_number,
                    country_id: assessment.country_id,
                    country_name: assessment.country_name,
                    region_id: assessment.region_id,
                    region_name: assessment.region_name,
                    date_of_assessment: assessment.date_of_assessment,
                    rating_value: null,
                    rating_title: '',
                };

                // Add empty assessment to first component group or create new one
                if (grouped.length === 0) {
                    grouped.push({
                        component_id: null,
                        component_num: null,
                        component_name: '',
                        area_id: null,
                        area_name: '',
                        assessments: [emptyAssessment],
                    });
                } else {
                    grouped[0].assessments.push(emptyAssessment);
                }
            }

            // Process components if they exist
            components.forEach((component) => {
                const componentId = component.component_id;
                let existingComponent = grouped.find(
                    (item) => item.component_id === componentId,
                );
                if (!existingComponent) {
                    existingComponent = {
                        component_id: componentId,
                        component_num: component.component_num,
                        component_name: component.component_name,
                        area_id: component.area_id,
                        area_name: component.area_name,
                        assessments: [],
                    };
                    grouped.push(existingComponent);
                }
                existingComponent.assessments.push({
                    assessment_id: assessment.id,
                    assessment_number: assessment.assessment_number,
                    country_id: assessment.country_id,
                    country_name: assessment.country_name,
                    region_id: assessment.region_id,
                    region_name: assessment.region_name,
                    date_of_assessment: assessment.date_of_assessment,
                    rating_value: component.rating_value,
                    rating_title: component.rating_title,
                });
            });
        });

        // Add country assessments tracking
        const countryAssessments = {};
        joinedData.forEach((data) => {
            if (!countryAssessments[data.country_name]) {
                countryAssessments[data.country_name] = [];
            }
            countryAssessments[data.country_name].push({
                assessment_number: data.assessment_number,
                date: data.date_of_assessment,
                area_ratings: data.area_ratings,
                components: data.components,
                phase: data.phase,
                phase_display: data.phase_display,
            });
        });

        Object.keys(countryAssessments).forEach((country) => {
            countryAssessments[country].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
        });

        // Write the joined data to new files
        await fs.writeFile(
            path.join(targetDir, 'map-data.json'),
            JSON.stringify(joinedData, null, 2),
        );

        // Write the component descriptions to a separate file
        await fs.writeFile(
            path.join(targetDir, 'component-descriptions.json'),
            JSON.stringify(componentDescriptions, null, 2),
        );

        // Save the processed data to per-assessments-processed.json
        await fs.writeFile(
            path.join(targetDir, 'per-assessments-processed.json'),
            JSON.stringify({ results: processedAssessments }, null, 2),
            'utf8',
        );

        // Add new dashboard data file
        await fs.writeFile(
            path.join(targetDir, 'per-dashboard-data.json'),
            JSON.stringify(
                {
                    assessments: grouped,
                    countryAssessments,
                },
                null,
                2,
            ),
        );

        console.log(
            `Processed ${processedAssessments.length} records successfully`,
        );
        console.log('Map data and component descriptions saved in JSON format');
        console.log(
            'Data processing complete. Processed data saved to per-assessments-processed.json',
        );
        console.log('- per-dashboard-data.json');
    } catch (error) {
        console.error('Error processing data:');
        throw error;
    }
}

// Execute the processing
if (require.main === module) {
    processData().catch(() => {
        console.error('Failed to process data');
        process.exit(1);
    });
} else {
    module.exports = { processData };
}
