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
    getKPIData,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
} from './PERSummaryDashboard/dataHandler';
import {
    ASSESSMENT_TYPE_COLORS,
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
        components: [],
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

    test('counts every filtered process record by assessment type', () => {
        const typeCounts = [
            { name: 'Self assessment', count: 112 },
            { name: 'Simulation', count: 28 },
            { name: 'Operational', count: 5 },
            { name: 'Post operational', count: 10 },
            { name: null, count: 17 },
        ] as const;
        let processId = 0;
        const history = typeCounts.flatMap(({ name, count }) => (
            Array.from({ length: count }, () => {
                processId += 1;
                return process({
                    processId,
                    countryId: ((processId - 1) % 114) + 1,
                    assessmentNumber: Math.floor((processId - 1) / 114) + 1,
                    typeOfAssessmentName: name,
                });
            })
        ));
        const state = selectFilteredDashboard(history);

        expect(getRecordsByAssessmentType(state)).toEqual([
            { label: 'Self assessment', count: 112 },
            { label: 'Simulation', count: 28 },
            { label: 'Operational', count: 5 },
            { label: 'Post operational', count: 10 },
        ]);
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
                        components: [],
                    },
                    {
                        assessmentId: 102,
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
                        components: [],
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

        expect(getPerformanceRatings(data, filters).overallRating.rating).toBe(3);
        expect(getPerformanceCycles(data, filters).cycles[0]?.rating).toBe(3);
        expect(getPerformanceSummary(data, filters).assessmentsWithComponentResponses).toBe(1);
    });

    test('normalizes apostrophes and non-ASCII country names without changing IDs', () => {
        const normalized = normalizeMapData({
            results: [{
                id: 22,
                country_id: 9,
                country_name: 'Côte d’Ivoire',
                country_iso3: 'CIV',
                region_name: 'Africa',
                assessment_number: 1,
                date_of_assessment: null,
                phase: 2,
            }],
        });

        expect(normalized.results[0]).toMatchObject({
            processId: 22,
            countryId: 9,
            countryName: 'Côte d’Ivoire',
        });
    });

    test('normalizes backend MENA labels to the canonical region key', () => {
        const normalized = normalizeMapData({
            results: [{
                id: 23,
                country_id: 16,
                country_name: 'Algeria',
                region_name: 'Middle East & North Africa',
                assessment_number: 1,
                phase: 2,
            }],
        });

        expect(normalized.results[0]?.regionName).toBe('MENA');
    });
});
