import {
    describe,
    expect,
    test,
} from 'vitest';

import { getPerAreaColor } from '#utils/domain/per';

import {
    getPerformanceCycles,
    getPerformanceRatings,
    getTotalAssessments,
    type PerformanceFilterState,
} from './PERPerformanceDashboard/dataHandler';
import {
    getActiveKpiKey,
    getActivePhaseLabel,
    getComponentSummaryForTreemap,
    getKPIData,
    getPERConsiderations,
    getPhaseCohort,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getRegionToggleCounts,
    getStackedBarDataByYearAndRegion,
    getYearOptions,
    getYearRegionChartData,
} from './PERSummaryDashboard/dataHandler';
import {
    ASSESSMENT_TYPE_COLORS,
    type ComponentAssessment,
    EMPTY_FILTERS,
    getLatestUpdate,
    getRegionLabel,
    normalizeMapData,
    type PerformanceCountryAssessment,
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
        typeOfAssessment: 1,
        assessmentMethod: null,
        prioritizedComponents: [],
        epiConsiderations: null,
        climateEnvironmentalConsiderations: null,
        urbanConsiderations: null,
        migrationConsiderations: null,
        ...overrides,
    };
}

function componentAssessment(overrides: Partial<ComponentAssessment>): ComponentAssessment {
    return {
        assessmentId: 1,
        assessmentNumber: 1,
        countryId: 1,
        countryName: 'Example',
        countryIso3: 'EXM',
        regionId: 1,
        regionName: 'Africa',
        typeOfAssessment: 1,
        dateOfAssessment: '2024-01-01',
        ratingValue: null,
        ratingTitle: null,
        ...overrides,
    };
}

function countryAssessment(
    overrides: Partial<PerformanceCountryAssessment>,
): PerformanceCountryAssessment {
    return {
        assessmentId: 1,
        assessmentNumber: 1,
        dateOfAssessment: '2024-01-01',
        countryId: 1,
        countryName: 'Example',
        countryIso3: 'EXM',
        regionId: 1,
        regionName: 'Africa',
        typeOfAssessment: 1,
        phase: 2,
        updatedAt: null,
        ...overrides,
    };
}

function performanceData(
    assessments: ComponentAssessment[],
    countryAssessments: PerformanceCountryAssessment[] = [],
): PerformanceData {
    return {
        assessments: [{
            componentId: 1,
            componentNum: 1,
            componentLetter: null,
            isParent: false,
            componentName: 'Policy and standards',
            areaId: 1,
            areaNum: 1,
            areaName: 'Policy Strategy and Standards',
            assessments,
        }],
        countryAssessments: { Example: countryAssessments },
    };
}

type RawProcess = NonNullable<Parameters<typeof normalizeMapData>[0]>['processes'][number];

function rawProcess(overrides: Partial<RawProcess>): RawProcess {
    return {
        id: 1,
        assessment_number: 1,
        date_of_assessment: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        country_id: 1,
        country_name: 'Example',
        national_society_name: 'Example Red Cross',
        country_iso3: 'EXM',
        region_id: null,
        latitude: null,
        longitude: null,
        phase: 1,
        type_of_assessment: null,
        assessment_method: null,
        prioritized_components: [],
        epi_considerations: null,
        climate_environmental_considerations: null,
        urban_considerations: null,
        migration_considerations: null,
        ...overrides,
    };
}

const NO_PERFORMANCE_FILTERS: PerformanceFilterState = { ...EMPTY_FILTERS, cycle: null };

describe('PER dashboard country identity selector', () => {
    test('uses the consultant palette consistently for assessment and region legends', () => {
        expect(ASSESSMENT_TYPE_COLORS).toEqual({
            SelfAssessment: '#A4BEDE',
            Simulation: '#009CDD',
            Operational: '#418FDE',
            PostOperational: '#236192',
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
            { id: 1, count: 112 },
            { id: 2, count: 28 },
            { id: 3, count: 5 },
            { id: 4, count: 10 },
            { id: null, count: 17 },
        ] as const;
        let processId = 0;
        const history = typeCounts.flatMap(({ id, count }) => (
            Array.from({ length: count }, (_, index) => {
                processId += 1;
                return process({
                    processId,
                    countryId: ((processId - 1) % 114) + 1,
                    assessmentNumber: Math.floor((processId - 1) / 114) + 1,
                    typeOfAssessment: id,
                    phase: id === 1 && index >= 110 ? 1 : 2,
                });
            })
        ));
        const state = selectFilteredDashboard(history);

        expect(getRecordsByAssessmentType(state)).toEqual([
            { label: 'SelfAssessment', count: 110 },
            { label: 'Simulation', count: 28 },
            { label: 'Operational', count: 5 },
            { label: 'PostOperational', count: 10 },
        ]);
    });

    test('filters by the assessment type id', () => {
        const processes = [
            process({
                processId: 1,
                countryId: 1,
                typeOfAssessment: 1,
                phase: 2,
            }),
            process({
                processId: 2,
                countryId: 2,
                typeOfAssessment: 2,
                phase: 2,
            }),
            process({
                processId: 3,
                countryId: 3,
                typeOfAssessment: 4,
                phase: 2,
            }),
        ];

        const simulation = selectFilteredDashboard(
            processes,
            { ...EMPTY_FILTERS, assessmentType: 'Simulation' },
        );
        const postOperational = selectFilteredDashboard(
            processes,
            { ...EMPTY_FILTERS, assessmentType: 'PostOperational' },
        );

        expect(Array.from(simulation.countryIds)).toEqual([2]);
        expect(Array.from(postOperational.countryIds)).toEqual([3]);
    });

    test('uses only the latest process of each NS for high-priority components', () => {
        const resourceMobilisation = {
            componentId: 37,
            componentTitle: 'Resource Mobilisation',
            areaTitle: 'Operations support',
            areaNum: 5,
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
        expect(resource?.color).toBe(getPerAreaColor(5));
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
            typeOfAssessment: 2,
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

    test('lists each year with a process once, in order, for the year filter', () => {
        const options = getYearOptions([
            process({ processId: 1, dateOfAssessment: '2021-05-01' }),
            process({ processId: 2, dateOfAssessment: '2019-03-15' }),
            process({ processId: 3, dateOfAssessment: '2021-11-30' }),
            process({ processId: 4, dateOfAssessment: null }),
        ]);

        expect(options).toEqual([
            { key: 2019, label: '2019' },
            { key: 2021, label: '2021' },
        ]);
    });

    test('rates each component 14 sub-component on its own and leaves out the parent', () => {
        const component = (
            overrides: Partial<PerformanceData['assessments'][number]>,
            ratingValue: number,
        ): PerformanceData['assessments'][number] => ({
            componentId: 1,
            componentNum: 1,
            componentLetter: null,
            isParent: false,
            componentName: 'Component',
            areaId: 3,
            areaNum: 3,
            areaName: 'Operational capacity',
            assessments: [componentAssessment({ assessmentId: 101, ratingValue })],
            ...overrides,
        });
        const data: PerformanceData = {
            assessments: [
                // NOTE: The parent is never rated above 0 ("Not reviewed")
                component({
                    componentId: 14,
                    componentNum: 14,
                    isParent: true,
                    componentName: 'NS-specific areas of intervention',
                }, 0),
                component({
                    componentId: 15,
                    componentNum: 14,
                    componentLetter: 'A',
                    componentName: 'Community-based DP and DRR',
                }, 4),
                component({
                    componentId: 16,
                    componentNum: 14,
                    componentLetter: 'B',
                    componentName: 'Evacuation',
                }, 2),
                component({
                    componentId: 29,
                    componentNum: 15,
                    componentName: 'Mapping of NS capacities',
                }, 3),
            ],
            countryAssessments: {
                Example: [countryAssessment({ assessmentId: 101 })],
                'No response': [countryAssessment({
                    assessmentId: null,
                    countryId: 2,
                    countryName: 'No response',
                    countryIso3: 'NRS',
                    dateOfAssessment: '2024-01-02',
                })],
            },
        };

        const ratings = getPerformanceRatings(data, NO_PERFORMANCE_FILTERS);

        expect(ratings.componentData.map(({
            id,
            letter,
            name,
            rating,
        }) => ({
            id,
            letter,
            name,
            rating,
        }))).toEqual([
            {
                id: 14,
                letter: 'A',
                name: 'Community-based DP and DRR',
                rating: 4,
            },
            {
                id: 14,
                letter: 'B',
                name: 'Evacuation',
                rating: 2,
            },
            {
                id: 15,
                letter: null,
                name: 'Mapping of NS capacities',
                rating: 3,
            },
        ]);
        // NOTE: Each sub-component counts as much as any other component
        expect(ratings.areaData).toMatchObject([{ name: 'Operational capacity', rating: 3 }]);
        expect(ratings.overallRating.rating).toBe(3);
        expect(getPerformanceCycles(data, NO_PERFORMANCE_FILTERS)).toMatchObject({
            total_cycles: 2,
            cycles: [{
                cycleNumber: 1,
                totalNS: 2,
                rating: 3,
            }],
        });
        expect(getTotalAssessments(data, NO_PERFORMANCE_FILTERS)).toBe(1);
    });

    test('colours the PER areas with the shared PER area colours', () => {
        const data = performanceData([componentAssessment({ ratingValue: 3 })]);

        const ratings = getPerformanceRatings(data, NO_PERFORMANCE_FILTERS);

        expect(ratings.areaData[0]?.areaColor).toBe(getPerAreaColor(1));
        expect(ratings.componentData[0]?.areaColor).toBe(getPerAreaColor(1));
    });

    test('normalizes apostrophes and non-ASCII country names without changing IDs', () => {
        const normalized = normalizeMapData({
            processes: [rawProcess({
                id: 22,
                country_id: 9,
                country_name: 'Côte d’Ivoire',
                national_society_name: 'Red Cross Society of Côte d’Ivoire',
                country_iso3: 'CIV',
                region_id: 0,
                phase: 2,
            })],
        });

        expect(normalized.processes[0]).toMatchObject({
            processId: 22,
            countryId: 9,
            countryName: 'Côte d’Ivoire',
            nationalSocietyName: 'Red Cross Society of Côte d’Ivoire',
        });
    });

    test('reads an empty National Society name as no name', () => {
        const normalized = normalizeMapData({
            processes: [rawProcess({ national_society_name: '' })],
        });

        expect(normalized.processes[0]?.nationalSocietyName).toBeNull();
    });

    test('identifies the region by region_id', () => {
        const normalized = normalizeMapData({
            processes: [
                // NOTE: Africa has the id 0, which must not be treated as missing
                rawProcess({ id: 1, region_id: 0 }),
                rawProcess({ id: 2, region_id: 1 }),
                rawProcess({ id: 3, region_id: 2 }),
                rawProcess({ id: 4, region_id: 3 }),
                rawProcess({ id: 5, region_id: 4 }),
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
                rawProcess({ id: 1, region_id: 99 }),
                rawProcess({ id: 2, region_id: null }),
            ],
        });

        expect(normalized.processes.map((item) => item.regionName)).toEqual([null, null]);
    });

    test('reads the snake_case process fields and the camelCase prioritized components', () => {
        const normalized = normalizeMapData({
            processes: [rawProcess({
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
                    areaNum: 4,
                    description: 'Some description',
                }],
            })],
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
                areaNum: 4,
                description: 'Some description',
            }],
        });
    });

    test('returns no processes before the data has loaded', () => {
        expect(normalizeMapData(undefined).processes).toEqual([]);
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

        const allProcessesState = selectFilteredDashboard([
            ...orientationOnlySecondCycle,
            ...twoCompletedCycles,
        ]);
        expect(getKPIData(allProcessesState).find((item) => item.key === 'completed')?.value)
            .toBe(1);
    });

    test('keeps the counts of the other regions when a region is selected', () => {
        const processes = [
            process({ processId: 1, countryId: 1, regionName: 'Africa' }),
            process({ processId: 2, countryId: 2, regionName: 'Africa' }),
            process({ processId: 3, countryId: 3, regionName: 'Europe' }),
        ];

        expect(getRegionToggleCounts(processes, { ...EMPTY_FILTERS, region: 'Africa' })).toEqual([
            { name: 'Africa', count: 2 },
            { name: 'Americas', count: 0 },
            { name: 'Asia Pacific', count: 0 },
            { name: 'Europe', count: 1 },
            { name: 'MENA', count: 0 },
        ]);
    });

    test('keeps every year in the year and region chart when a year is selected', () => {
        const processes = [
            process({ processId: 1, countryId: 1, dateOfAssessment: '2021-05-01' }),
            process({ processId: 2, countryId: 2, dateOfAssessment: '2023-03-15' }),
        ];

        const chartData = getYearRegionChartData(processes, { ...EMPTY_FILTERS, year: 2021 });

        expect(chartData.map((item) => item.year)).toEqual([2021, 2023]);
    });

    test('does not count a consideration ticked during Orientation in the consideration filter', () => {
        const processes = [
            process({
                processId: 1,
                countryId: 1,
                phase: 1,
                epiConsiderations: true,
            }),
            process({
                processId: 2,
                countryId: 2,
                phase: 2,
                epiConsiderations: true,
            }),
        ];
        const state = selectFilteredDashboard(processes, { ...EMPTY_FILTERS, consideration: 'epi' });

        expect(Array.from(state.countryIds)).toEqual([2]);
        const { totals } = getPERConsiderations(selectFilteredDashboard(processes));
        expect(totals.totalEpiConsiderations).toBe(1);
    });

    test('selects the KPI tab and phase of the active phase filter', () => {
        expect([2, 3, 4].map(getPhaseCohort)).toEqual(['assessment', 'assessment', 'assessment']);
        expect(getPhaseCohort(1)).toBe('orientation');
        expect(getPhaseCohort(5)).toBe('action');

        const assessmentFilters = { ...EMPTY_FILTERS, phaseCohort: 'assessment' as const };
        expect(getActiveKpiKey(assessmentFilters)).toBe('assessment');
        expect(getActivePhaseLabel(assessmentFilters)).toBe('Assessment');

        const completedFilters = { ...EMPTY_FILTERS, minimumCycles: 2 };
        expect(getActiveKpiKey(completedFilters)).toBe('completed');
        expect(getActivePhaseLabel(completedFilters)).toBeNull();

        // NOTE: a cleared phase filter selects the first tab and no phase
        expect(getActiveKpiKey(EMPTY_FILTERS)).toBe('total-engaged');
        expect(getActivePhaseLabel(EMPTY_FILTERS)).toBeNull();
    });

    test('does not count Orientation-only entries in the PER cycles', () => {
        // NOTE: NS 1 is in a later cycle only with an Orientation
        const data = performanceData([], [
            countryAssessment({
                assessmentId: 11,
                countryId: 1,
                assessmentNumber: 1,
                phase: 5,
            }),
            countryAssessment({
                assessmentId: 12,
                countryId: 1,
                assessmentNumber: 2,
                phase: 1,
            }),
            countryAssessment({
                assessmentId: 21,
                countryId: 2,
                assessmentNumber: 1,
                phase: 1,
            }),
        ]);

        expect(getPerformanceCycles(data, NO_PERFORMANCE_FILTERS)).toMatchObject({
            total_cycles: 1,
            cycles: [{
                cycleNumber: 1,
                totalNS: 1,
                completed: 0,
                inProgress: 1,
            }],
        });
    });

    test('shows MENA in English and the translated server names in the other languages', () => {
        const translatedOptions = [
            { key: 0, value: 'Translated Africa' },
            { key: 4, value: 'Translated MENA' },
        ];
        const englishOptions = [
            { key: 0, value: 'Africa' },
            { key: 4, value: 'Middle East & North Africa' },
        ];

        expect(getRegionLabel('MENA', englishOptions, 'en')).toBe('MENA');
        expect(getRegionLabel('Africa', englishOptions, 'en')).toBe('Africa');
        expect(getRegionLabel('MENA', translatedOptions, 'es')).toBe('Translated MENA');
        expect(getRegionLabel('Africa', translatedOptions, 'es')).toBe('Translated Africa');
        // NOTE: falls back to the key while the enums are not loaded yet
        expect(getRegionLabel('MENA', undefined, 'es')).toBe('MENA');
    });

    test('returns the filtered NS even when its region is not known', () => {
        const unknownRegion = process({
            processId: 1,
            countryId: 7,
            regionId: null,
            regionName: null,
            phase: 2,
        });

        const state = selectFilteredDashboard([unknownRegion], { ...EMPTY_FILTERS, countryId: 7 });

        expect(state.processes).toEqual([unknownRegion]);
    });

    test('leaves unrated components out of the ratings, using the latest assessment of each NS', () => {
        const data = performanceData([
            componentAssessment({
                assessmentId: 11,
                countryId: 1,
                assessmentNumber: 1,
                ratingValue: 3,
            }),
            componentAssessment({
                assessmentId: 12,
                countryId: 1,
                assessmentNumber: 2,
                ratingValue: 4,
            }),
            // NOTE: the latest assessment of this NS did not rate the component, so the
            // NS is left out instead of falling back to its cycle 1 rating
            componentAssessment({
                assessmentId: 21,
                countryId: 2,
                assessmentNumber: 1,
                ratingValue: 3,
            }),
            componentAssessment({
                assessmentId: 22,
                countryId: 2,
                assessmentNumber: 2,
                ratingValue: null,
            }),
            // NOTE: 0 is "Not reviewed"
            componentAssessment({
                assessmentId: 32,
                countryId: 3,
                assessmentNumber: 2,
                ratingValue: 0,
            }),
        ]);

        const ratings = getPerformanceRatings(data, NO_PERFORMANCE_FILTERS);

        expect(ratings.overallRating).toMatchObject({
            rating: 4,
            change: 1,
            cycleRatings: [
                { cycle: '1', rating: 3 },
                { cycle: '2', rating: 4 },
            ],
        });
        expect(ratings.areaData.map((area) => area.rating)).toEqual([4]);
        expect(ratings.componentData.map((component) => component.rating)).toEqual([4]);
    });

    test('has no rating for a cycle without rated assessments', () => {
        const data = performanceData(
            [
                componentAssessment({ assessmentId: 11, assessmentNumber: 1, ratingValue: 3 }),
                componentAssessment({ assessmentId: 12, assessmentNumber: 2, ratingValue: 0 }),
            ],
            [
                countryAssessment({ assessmentId: 11, assessmentNumber: 1 }),
                countryAssessment({ assessmentId: 12, assessmentNumber: 2 }),
            ],
        );

        expect(getPerformanceCycles(data, NO_PERFORMANCE_FILTERS).cycles).toMatchObject([
            { cycleNumber: 1, rating: 3, ratingChange: 0 },
            { cycleNumber: 2, rating: null, ratingChange: 0 },
        ]);
    });

    test('rates a cycle like the header, with every component counting equally', () => {
        const component = (
            componentId: number,
            assessments: ComponentAssessment[],
        ): PerformanceData['assessments'][number] => ({
            componentId,
            componentNum: componentId,
            componentLetter: null,
            isParent: false,
            componentName: `Component ${componentId}`,
            areaId: 1,
            areaNum: 1,
            areaName: 'Policy Strategy and Standards',
            assessments,
        });
        // NOTE: NS 1 rated both components 4 and NS 2 rated only the first one, with 2.
        // Per component that is 3 and 4, so 3.5; per assessment it would be 4 and 2, so 3.
        const data: PerformanceData = {
            assessments: [
                component(1, [
                    componentAssessment({ assessmentId: 11, countryId: 1, ratingValue: 4 }),
                    componentAssessment({ assessmentId: 21, countryId: 2, ratingValue: 2 }),
                ]),
                component(2, [
                    componentAssessment({ assessmentId: 11, countryId: 1, ratingValue: 4 }),
                ]),
            ],
            countryAssessments: {
                Example: [
                    countryAssessment({ assessmentId: 11, countryId: 1 }),
                    countryAssessment({ assessmentId: 21, countryId: 2 }),
                ],
            },
        };

        const [firstCycle] = getPerformanceCycles(data, NO_PERFORMANCE_FILTERS).cycles;
        const header = getPerformanceRatings(data, { ...NO_PERFORMANCE_FILTERS, cycle: 1 });

        expect(firstCycle?.rating).toBe(3.5);
        expect(header.overallRating.rating).toBe(3.5);
    });

    test('uses the newest updated_at of the payload as the latest update', () => {
        expect(getLatestUpdate([
            null,
            '2026-03-01T10:00:00Z',
            '2026-09-15T08:30:00Z',
            '2025-12-31T00:00:00Z',
        ])).toBe('2026-09-15T08:30:00Z');
        expect(getLatestUpdate([null])).toBeUndefined();
    });
});
