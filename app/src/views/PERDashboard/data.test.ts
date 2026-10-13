import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    getPerformanceCycles,
    getPerformanceRatings,
    getPerformanceSummary,
    type PerformanceFilterState,
} from './PERPerformanceDashboard/dataHandler';
import {
    getComponentSummaryForTreemap,
    getKPIData,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
} from './PERSummaryDashboard/dataHandler';
import {
    ASSESSMENT_TYPE_COLORS,
    EMPTY_FILTERS,
    normalizeMapData,
    type PerformanceData,
    type ProcessRecord,
    REGION_COLORS,
    selectFilteredDashboard,
} from './data';

function process(overrides: Partial<ProcessRecord>): ProcessRecord {
    return {
        processId: 1,
        countryId: 1,
        countryName: 'Example',
        nationalSocietyName: 'Example Red Cross',
        countryIso3: 'EXM',
        regionId: 1,
        regionName: 'Africa',
        latitude: 0,
        longitude: 0,
        assessmentNumber: 1,
        dateOfAssessment: '2024-01-01',
        createdAt: null,
        updatedAt: null,
        phase: 1,
        phaseDisplay: 'Orientation',
        typeOfAssessment: 0,
        typeOfAssessmentName: 'Self assessment',
        assessmentMethod: null,
        prioritizedComponents: [],
        epiConsiderations: null,
        climateEnvironmentalConsiderations: null,
        urbanConsiderations: null,
        migrationConsiderations: null,
        ...overrides,
    };
}

describe('PER dashboard country identity selector', () => {
    test('uses the consultant palette consistently for assessment and region legends', () => {
        expect(ASSESSMENT_TYPE_COLORS).toEqual({
            'Self assessment': '#A4BEDE',
            Simulation: '#009CDD',
            Operational: '#418FDE',
            'Post operational': '#236192',
        });
        expect(REGION_COLORS).toEqual({
            Africa: '#A4BEDE',
            Americas: '#009CDD',
            'Asia Pacific': '#418FDE',
            Europe: '#236192',
            MENA: '#1B365D',
        });
    });

    test('does not treat a colliding process ID as a country ID', () => {
        const ghana = process({
            processId: 87,
            countryId: 114,
            countryName: 'Ghana',
            phase: 5,
        });
        const unrelatedAlgeriaProcess = process({
            processId: 114,
            countryId: 3,
            countryName: 'Algeria',
            regionName: 'MENA',
            regionId: 5,
            phase: 2,
        });

        const state = selectFilteredDashboard(
            [ghana, unrelatedAlgeriaProcess],
            {
                countryId: 114,
                region: null,
                year: null,
                assessmentType: null,
                phaseCohort: null,
                minimumCycles: null,
                consideration: null,
                highPriorityComponent: null,
            },
        );

        expect(state.processes).toEqual([ghana]);
        expect(getKPIData(state).map((item) => [item.key, item.value])).toEqual([
            ['total-engaged', 1],
            ['orientation', 0],
            ['assessment', 1],
            ['action', 1],
            ['completed', 0],
        ]);
        expect(getRecordsByRegion(state)).toEqual([
            { name: 'Africa', count: 1 },
            { name: 'Americas', count: 0 },
            { name: 'Asia Pacific', count: 0 },
            { name: 'Europe', count: 0 },
            { name: 'MENA', count: 0 },
        ]);
    });

    test('retains undated processes for KPI filtering but excludes them from year filters', () => {
        const undatedAlgeria = process({
            processId: 3,
            countryId: 114,
            countryName: 'Algeria',
            regionId: 5,
            regionName: 'MENA',
            dateOfAssessment: null,
            phase: 2,
        });

        const allYears = selectFilteredDashboard(
            [undatedAlgeria],
            {
                countryId: 114,
                region: null,
                year: null,
                assessmentType: null,
                phaseCohort: null,
                minimumCycles: null,
                consideration: null,
                highPriorityComponent: null,
            },
        );
        const yearOnly = selectFilteredDashboard(
            [undatedAlgeria],
            {
                countryId: 114,
                region: null,
                year: 2024,
                assessmentType: null,
                phaseCohort: null,
                minimumCycles: null,
                consideration: null,
                highPriorityComponent: null,
            },
        );

        expect(getKPIData(allYears)[0]?.value).toBe(1);
        expect(yearOnly.countryIds.size).toBe(0);
    });

    test('excludes Orientation processes from assessment type counts', () => {
        const typeCounts = [
            { name: 'Self assessment', count: 112 },
            { name: 'Simulation', count: 28 },
            { name: 'Operational', count: 5 },
            { name: 'Post operational', count: 10 },
            { name: null, count: 17 },
        ] as const;
        let processId = 0;
        const history = typeCounts.flatMap(({ name, count }) => (
            Array.from({ length: count }, (_, index) => {
                processId += 1;
                return process({
                    processId,
                    countryId: ((processId - 1) % 114) + 1,
                    assessmentNumber: Math.floor((processId - 1) / 114) + 1,
                    typeOfAssessmentName: name,
                    phase: name === 'Self assessment' && index >= 110 ? 1 : 2,
                });
            })
        ));
        const state = selectFilteredDashboard(history);

        expect(getRecordsByAssessmentType(state)).toEqual([
            { label: 'Self assessment', count: 110 },
            { label: 'Simulation', count: 28 },
            { label: 'Operational', count: 5 },
            { label: 'Post operational', count: 10 },
        ]);
    });

    test('uses only the latest process of each NS for high-priority components', () => {
        const resourceMobilisation = {
            componentId: 37,
            componentTitle: 'Resource Mobilisation',
            areaTitle: 'Operations support',
            description: null,
        };
        const history = [
            process({
                processId: 1,
                countryId: 1,
                assessmentNumber: 1,
                prioritizedComponents: [resourceMobilisation],
            }),
            process({ processId: 2, countryId: 1, assessmentNumber: 2 }),
            process({
                processId: 3,
                countryId: 2,
                assessmentNumber: 2,
                prioritizedComponents: [resourceMobilisation],
            }),
        ];
        const state = selectFilteredDashboard(history);
        const resource = getComponentSummaryForTreemap(state).children
            ?.flatMap((area) => area.children ?? [])
            .find((component) => component.name === 'Resource Mobilisation');

        expect(resource?.value).toBe(1);
        expect(selectFilteredDashboard(history, {
            countryId: null,
            region: null,
            year: null,
            assessmentType: null,
            phaseCohort: null,
            minimumCycles: null,
            consideration: null,
            highPriorityComponent: 'Resource Mobilisation',
        }).countryIds).toEqual(new Set([2]));
    });

    test('uses process percentages but NS counts and bars for considerations', () => {
        const consideration = (
            processId: number,
            countryId: number,
            date: string,
            ready: boolean,
        ) => process({
            processId,
            countryId,
            dateOfAssessment: date,
            phase: 2,
            epiConsiderations: ready,
            climateEnvironmentalConsiderations: ready,
            urbanConsiderations: ready,
            migrationConsiderations: ready,
        });
        const state = selectFilteredDashboard([
            consideration(1, 1, '2017-01-01', true),
            consideration(2, 1, '2018-01-01', true),
            consideration(3, 1, '2021-01-01', true),
            consideration(4, 2, '2023-01-01', false),
            consideration(5, 1, '2024-01-01', true),
            consideration(6, 3, '2017-01-01', true),
        ]);
        const result = getPERConsiderations(state);

        expect(result.totals).toMatchObject({
            totalEpiConsiderations: 2,
            totalClimateConsiderations: 2,
            totalUrbanConsiderations: 2,
            totalMigrationConsiderations: 2,
        });
        expect(result.percentages).toEqual({
            epiPercentage: 75,
            climatePercentage: 66,
            urbanPercentage: 66,
            migrationPercentage: 50,
        });
        expect(result.data.map((chart) => chart[0]?.SelfAssessment)).toEqual([2, 2, 2, 2]);
    });

    test('counts every process record in the year and region chart', () => {
        const hondurasSimulation = process({
            processId: 50,
            countryId: 81,
            countryName: 'Honduras',
            regionId: 2,
            regionName: 'Americas',
            assessmentNumber: 2,
            dateOfAssessment: '2019-03-15',
            typeOfAssessmentName: 'Simulation',
        });
        const hondurasSelfAssessment = process({
            processId: 76,
            countryId: 81,
            countryName: 'Honduras',
            regionId: 2,
            regionName: 'Americas',
            assessmentNumber: 3,
            dateOfAssessment: '2019-11-15',
        });
        const state = selectFilteredDashboard([hondurasSimulation, hondurasSelfAssessment]);

        expect(getStackedBarDataByYearAndRegion(state)).toEqual([{
            year: 2019,
            label: '2019',
            values: {
                Africa: 0,
                Americas: 2,
                'Asia Pacific': 0,
                Europe: 0,
                MENA: 0,
            },
        }]);
    });

    test('aggregates component 14 subcomponents into one consultant reporting bucket', () => {
        const data: PerformanceData = {
            assessments: [
                {
                    componentId: 14,
                    componentNum: 14,
                    componentName: 'NS-specific areas of intervention',
                    areaId: 3,
                    areaName: 'Operational capacity',
                    assessments: [{
                        assessmentId: 101,
                        assessmentNumber: 1,
                        countryId: 1,
                        countryName: 'Example',
                        countryIso3: 'EXM',
                        regionId: 1,
                        regionName: 'Africa',
                        typeOfAssessmentName: 'Self assessment',
                        dateOfAssessment: '2024-01-01',
                        ratingValue: 1,
                        ratingTitle: 'Does Not Exist',
                    }],
                },
                {
                    componentId: 15,
                    componentNum: 14,
                    componentName: 'Community-based DP and DRR',
                    areaId: 3,
                    areaName: 'Operational capacity',
                    assessments: [{
                        assessmentId: 101,
                        assessmentNumber: 1,
                        countryId: 1,
                        countryName: 'Example',
                        countryIso3: 'EXM',
                        regionId: 1,
                        regionName: 'Africa',
                        typeOfAssessmentName: 'Self assessment',
                        dateOfAssessment: '2024-01-01',
                        ratingValue: 4,
                        ratingTitle: 'Exists – Could be Strengthened',
                    }],
                },
                {
                    componentId: 29,
                    componentNum: 15,
                    componentName: 'Mapping of NS capacities',
                    areaId: 3,
                    areaName: 'Operational capacity',
                    assessments: [{
                        assessmentId: 101,
                        assessmentNumber: 1,
                        countryId: 1,
                        countryName: 'Example',
                        countryIso3: 'EXM',
                        regionId: 1,
                        regionName: 'Africa',
                        typeOfAssessmentName: 'Self assessment',
                        dateOfAssessment: '2024-01-01',
                        ratingValue: 2,
                        ratingTitle: 'Partially Exists',
                    }],
                },
            ],
            countryAssessments: {
                Example: [
                    {
                        assessmentId: 101,
                        assessmentNumber: 1,
                        countryId: 1,
                        countryName: 'Example',
                        countryIso3: 'EXM',
                        regionId: 1,
                        regionName: 'Africa',
                        typeOfAssessmentName: 'Self assessment',
                        dateOfAssessment: '2024-01-01',
                        phase: 2,
                        phaseDisplay: 'Assessment',
                    },
                    {
                        assessmentId: null,
                        assessmentNumber: 1,
                        countryId: 2,
                        countryName: 'No response',
                        countryIso3: 'NRS',
                        regionId: 1,
                        regionName: 'Africa',
                        typeOfAssessmentName: 'Self assessment',
                        dateOfAssessment: '2024-01-02',
                        phase: 2,
                        phaseDisplay: 'Assessment',
                    },
                ],
            },
        };
        const filters: PerformanceFilterState = {
            countryId: null,
            region: null,
            year: null,
            assessmentType: null,
            phaseCohort: null,
            minimumCycles: null,
            consideration: null,
            highPriorityComponent: null,
            cycle: null,
        };

        expect(getPerformanceRatings(data, filters).overallRating).toMatchObject({
            rating: 3,
            status: 'Needs Improvement',
        });
        expect(getPerformanceCycles(data, filters)).toMatchObject({
            total_cycles: 2,
            cycles: [{
                cycle: 'Cycle 1',
                totalNS: 2,
                rating: 2.33,
            }],
        });
        expect(getPerformanceSummary(data, filters).totalAssessments).toBe(1);
    });

    test('normalizes apostrophes and non-ASCII country names without changing IDs', () => {
        const normalized = normalizeMapData({
            processes: [{
                id: 22,
                country_id: 9,
                country_name: 'Côte d’Ivoire',
                national_society_name: 'Red Cross Society of Côte d’Ivoire',
                country_iso3: 'CIV',
                region_id: 0,
                assessment_number: 1,
                date_of_assessment: null,
                phase: 2,
            }],
        });

        expect(normalized.processes[0]).toMatchObject({
            processId: 22,
            countryId: 9,
            countryName: 'Côte d’Ivoire',
            nationalSocietyName: 'Red Cross Society of Côte d’Ivoire',
        });
    });

    test('identifies the region by region_id, whatever language region_name is in', () => {
        const normalized = normalizeMapData({
            processes: [
                // NOTE: Africa has the id 0, which must not be treated as missing
                { id: 1, region_id: 0, region_name: 'África' },
                { id: 2, region_id: 1, region_name: 'Amériques' },
                { id: 3, region_id: 2, region_name: 'Asia-Pacífico' },
                { id: 4, region_id: 3, region_name: 'Europa' },
                { id: 5, region_id: 4, region_name: 'الشرق الأوسط وشمال أفريقيا' },
            ],
        });

        expect(normalized.processes.map((item) => item.regionName)).toEqual([
            'Africa',
            'Americas',
            'Asia Pacific',
            'Europe',
            'MENA',
        ]);
    });

    test('does not guess a region without a known region_id', () => {
        const normalized = normalizeMapData({
            processes: [
                { id: 1, region_name: 'Africa' },
                { id: 2, region_id: 99, region_name: 'Africa' },
                { id: 3, region_id: null, region_name: 'Africa' },
            ],
        });

        expect(normalized.processes.map((item) => item.regionName)).toEqual([null, null, null]);
    });

    test('reads the snake_case process fields and the camelCase prioritized components', () => {
        const normalized = normalizeMapData({
            processes: [{
                id: 7,
                country_id: 3,
                assessment_number: 2,
                region_id: 4,
                phase: 5,
                epi_considerations: true,
                climate_environmental_considerations: false,
                urban_considerations: null,
                prioritized_components: [{
                    componentId: 11,
                    componentTitle: 'Coordination',
                    areaTitle: 'Coordination',
                    description: 'Some description',
                }],
            }],
        });

        expect(normalized.processes[0]).toMatchObject({
            processId: 7,
            countryId: 3,
            assessmentNumber: 2,
            regionName: 'MENA',
            phase: 5,
            epiConsiderations: true,
            climateEnvironmentalConsiderations: false,
            urbanConsiderations: null,
            prioritizedComponents: [{
                componentId: 11,
                componentTitle: 'Coordination',
                areaTitle: 'Coordination',
                description: 'Some description',
            }],
        });
    });

    test('does not count Orientation-only processes as completed cycles', () => {
        function cycleProcess(countryId: number, assessmentNumber: number, phase: number) {
            return process({
                processId: (countryId * 10) + assessmentNumber,
                countryId,
                assessmentNumber,
                phase,
            });
        }
        // NOTE: cycle 2 is only an Orientation, so this NS completed 1 cycle, not 2
        const orientationOnlySecondCycle = [cycleProcess(1, 1, 5), cycleProcess(1, 2, 1)];
        const twoCompletedCycles = [cycleProcess(2, 1, 5), cycleProcess(2, 2, 2)];
        const filters = { ...EMPTY_FILTERS, minimumCycles: 2 };

        const orientationOnlyState = selectFilteredDashboard(orientationOnlySecondCycle, filters);
        const completedState = selectFilteredDashboard(twoCompletedCycles, filters);

        expect(orientationOnlyState.countryIds.size).toBe(0);
        expect(Array.from(completedState.countryIds)).toEqual([2]);
    });
});
