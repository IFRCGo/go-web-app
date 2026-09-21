import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    EMPTY_FILTERS,
    type ProcessRecord,
    selectFilteredDashboard,
} from '../data';
import { getDashboardWorkbookData } from './export';

function process(overrides: Partial<ProcessRecord>): ProcessRecord {
    return {
        processId: 1,
        countryId: 1,
        countryName: 'Example country',
        nationalSocietyName: 'Example Red Cross',
        countryIso3: 'EXM',
        regionId: 1,
        regionName: 'Africa',
        latitude: null,
        longitude: null,
        assessmentNumber: 1,
        dateOfAssessment: '2019-01-01',
        createdAt: null,
        updatedAt: null,
        phase: 2,
        phaseDisplay: 'Assessment',
        typeOfAssessment: 1,
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

function sheet(data: ReturnType<typeof getDashboardWorkbookData>, name: string) {
    const result = data.sheets.find((item) => item.name === name);
    if (!result) {
        throw new Error(`Missing ${name} worksheet`);
    }
    return result;
}

describe('PER dashboard workbook export', () => {
    test('applies combined filters and uses the latest process within the filtered scope for priorities', () => {
        const logistics = {
            componentId: 1,
            componentTitle: 'Logistics',
            areaTitle: 'Operations support',
            description: null,
        };
        const resourceMobilisation = {
            componentId: 2,
            componentTitle: 'Resource Mobilisation',
            areaTitle: 'Operations support',
            description: null,
        };
        const history = [
            process({
                processId: 1,
                assessmentNumber: 1,
                dateOfAssessment: '2018-01-01',
                prioritizedComponents: [logistics],
            }),
            process({
                processId: 2,
                assessmentNumber: 2,
                dateOfAssessment: '2019-03-01',
                prioritizedComponents: [logistics, resourceMobilisation],
            }),
            process({
                processId: 3,
                assessmentNumber: 3,
                dateOfAssessment: '2024-01-01',
                prioritizedComponents: [],
            }),
            process({
                processId: 4,
                countryId: 2,
                countryName: 'Other country',
                nationalSocietyName: 'Other Red Cross',
                assessmentNumber: 1,
                dateOfAssessment: '2019-03-01',
                regionName: 'Europe',
            }),
        ];
        const filters = {
            ...EMPTY_FILTERS,
            year: 2019,
            region: 'Africa' as const,
            assessmentType: 'Self assessment',
        };
        const data = getDashboardWorkbookData(selectFilteredDashboard(history, filters), filters);

        expect(data.nationalSocietyCount).toBe(1);
        expect(data.sheets.map((item) => item.name)).toEqual([
            'Filters and Summary',
            'Map Data',
            'Assessment Types',
            'Year and Region',
            'High Priority Components',
            'PER Considerations',
        ]);
        expect(sheet(data, 'Map Data')).toMatchObject({
            columns: [
                'National Society',
                'Country',
                'Region',
                'ISO3',
                'Current PER phase',
                'Cycle year',
                'Cycle iteration',
            ],
            rows: [[
                'Example Red Cross',
                'Example country',
                'Africa',
                'EXM',
                'Assessment',
                2019,
                2,
            ]],
        });
        expect(sheet(data, 'High Priority Components').rows).toEqual([[
            'Example Red Cross',
            'Example country',
            'Africa',
            'EXM',
            2,
            2019,
            'Logistics; Resource Mobilisation',
        ]]);
        expect(sheet(data, 'Assessment Types').rows).toEqual([[
            'Example Red Cross',
            'Example country',
            'Africa',
            'EXM',
            '',
            2019,
            1,
        ]]);
    });

    test('keeps historical completed consideration evidence and excludes Orientation-only records', () => {
        const history = [
            process({
                processId: 1,
                countryId: 1,
                nationalSocietyName: 'Orientation Red Cross',
                phase: 1,
                phaseDisplay: 'Orientation',
                epiConsiderations: true,
            }),
            process({
                processId: 2,
                countryId: 2,
                countryName: 'Historical country',
                nationalSocietyName: '',
                countryIso3: 'HIS',
                assessmentNumber: 1,
                dateOfAssessment: '2019-01-01',
                phase: 2,
                epiConsiderations: true,
            }),
            process({
                processId: 3,
                countryId: 2,
                countryName: 'Historical country',
                nationalSocietyName: '',
                countryIso3: 'HIS',
                assessmentNumber: 2,
                dateOfAssessment: '2020-01-01',
                phase: 2,
                epiConsiderations: false,
            }),
        ];
        const filters = {
            ...EMPTY_FILTERS,
            consideration: 'epi' as const,
        };
        const data = getDashboardWorkbookData(selectFilteredDashboard(history, filters), filters);
        const considerations = sheet(data, 'PER Considerations');

        expect(data.nationalSocietyCount).toBe(1);
        expect(considerations.columns).toEqual([
            'National Society',
            'Country',
            'Region',
            'ISO3',
            'EPI Cycle 1 year',
            'EPI Process count',
        ]);
        expect(considerations.rows).toEqual([[
            '',
            'Historical country',
            'Africa',
            'HIS',
            2019,
            1,
        ]]);
    });
});
