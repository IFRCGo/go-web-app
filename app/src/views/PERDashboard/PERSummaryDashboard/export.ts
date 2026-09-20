import FileSaver from 'file-saver';

import {
    compareProcessRecency,
    type ConsiderationKey,
    type DashboardFilterState,
    type FilteredDashboardState,
    getProcessYear,
    type ProcessRecord,
} from '../data';

type CellValue = number | string;

interface ProcessGroup {
    countryId: number;
    processes: ProcessRecord[];
}

export interface DashboardWorkbookSheet {
    name: string;
    columns: string[];
    rows: CellValue[][];
}

export interface DashboardWorkbookData {
    nationalSocietyCount: number;
    sheets: DashboardWorkbookSheet[];
}

const IDENTITY_COLUMNS = [
    'National Society',
    'Country',
    'Region',
    'ISO3',
];

const ASSESSMENT_TYPES = [
    'Self assessment',
    'Simulation',
    'Operational',
    'Post operational',
] as const;

const CONSIDERATIONS: Array<{
    key: ConsiderationKey;
    label: string;
    field: 'epiConsiderations'
        | 'climateEnvironmentalConsiderations'
        | 'urbanConsiderations'
        | 'migrationConsiderations';
}> = [
    { key: 'epi', label: 'EPI', field: 'epiConsiderations' },
    {
        key: 'climate',
        label: 'Climate',
        field: 'climateEnvironmentalConsiderations',
    },
    { key: 'urban', label: 'Urban', field: 'urbanConsiderations' },
    { key: 'migration', label: 'Migration', field: 'migrationConsiderations' },
];

function latestProcess(processes: ProcessRecord[]): ProcessRecord | undefined {
    return processes.reduce<ProcessRecord | undefined>(
        (latest, process) => (
            !latest || compareProcessRecency(process, latest) > 0 ? process : latest
        ),
        undefined,
    );
}

function groupByCountry(processes: ProcessRecord[]): ProcessGroup[] {
    const groups = new Map<number, ProcessRecord[]>();
    processes.forEach((process) => {
        if (process.countryId === null) {
            return;
        }
        const countryProcesses = groups.get(process.countryId) ?? [];
        countryProcesses.push(process);
        groups.set(process.countryId, countryProcesses);
    });

    return Array.from(groups.entries())
        .map(([countryId, countryProcesses]) => ({
            countryId,
            processes: countryProcesses,
        }))
        .sort((left, right) => {
            const leftName = latestProcess(left.processes)?.nationalSocietyName
                ?? latestProcess(left.processes)?.countryName
                ?? '';
            const rightName = latestProcess(right.processes)?.nationalSocietyName
                ?? latestProcess(right.processes)?.countryName
                ?? '';
            return leftName.localeCompare(rightName);
        });
}

function scopedProcessGroups(
    state: FilteredDashboardState,
    filters: DashboardFilterState,
): ProcessGroup[] {
    return groupByCountry(state.processes)
        .map((group) => {
            let { processes } = group;
            if (filters.highPriorityComponent !== null) {
                const latest = latestProcess(processes);
                processes = latest?.prioritizedComponents.some(
                    (component) => component.componentTitle === filters.highPriorityComponent,
                ) ? [latest] : [];
            }
            if (filters.phaseCohort === 'orientation') {
                processes = processes.filter((process) => (process.phase ?? 0) < 2);
            } else if (filters.phaseCohort === 'assessment') {
                processes = processes.filter((process) => (process.phase ?? 0) >= 2);
            } else if (filters.phaseCohort === 'action') {
                processes = processes.filter((process) => (process.phase ?? 0) >= 5);
            }
            if (filters.consideration !== null) {
                const consideration = CONSIDERATIONS.find(
                    (item) => item.key === filters.consideration,
                );
                if (consideration) {
                    processes = processes.filter((process) => (
                        (process.phase ?? 0) >= 2
                        && process[consideration.field] === true
                    ));
                }
            }
            return {
                ...group,
                processes,
            };
        })
        .filter((group) => group.processes.length > 0);
}

function identityValues(processes: ProcessRecord[]): CellValue[] {
    const process = latestProcess(processes);
    return [
        process?.nationalSocietyName ?? '',
        process?.countryName ?? '',
        process?.regionName ?? '',
        process?.countryIso3 ?? '',
    ];
}

function cycleColumns(label: string, maximumCycle: number): string[] {
    const prefix = label ? `${label} ` : '';
    return [
        ...Array.from(
            { length: maximumCycle },
            (_, index) => `${prefix}Cycle ${index + 1} year`,
        ),
        `${prefix}Process count`,
    ];
}

function cycleValues(processes: ProcessRecord[], maximumCycle: number): CellValue[] {
    const byCycle = new Map<number, ProcessRecord>();
    processes.forEach((process) => {
        const current = byCycle.get(process.assessmentNumber);
        if (!current || compareProcessRecency(process, current) > 0) {
            byCycle.set(process.assessmentNumber, process);
        }
    });
    return [
        ...Array.from(
            { length: maximumCycle },
            (_, index) => {
                const process = byCycle.get(index + 1);
                return process ? getProcessYear(process) ?? '' : '';
            },
        ),
        processes.length,
    ];
}

function maxCycle(processGroups: ProcessRecord[][]): number {
    return Math.max(
        0,
        ...processGroups.flatMap((processes) => (
            processes.map((process) => process.assessmentNumber)
        )),
    );
}

function phaseLabel(phase: DashboardFilterState['phaseCohort']): string | null {
    if (phase === 'orientation') return 'Orientation';
    if (phase === 'assessment') return 'Assessment or later';
    if (phase === 'action') return 'Action & accountability';
    return null;
}

function filterSummaryRows(
    groups: ProcessGroup[],
    filters: DashboardFilterState,
): CellValue[][] {
    const country = groups.flatMap((group) => group.processes)
        .find((process) => process.countryId === filters.countryId);
    const phase = phaseLabel(filters.phaseCohort);
    const countryValue = country?.countryName ?? String(filters.countryId);
    const consideration = CONSIDERATIONS.find((item) => item.key === filters.consideration);
    const rows: CellValue[][] = [
        ['Matching National Societies', groups.length],
        ['Matching processes', groups.reduce((total, group) => total + group.processes.length, 0)],
    ];
    const activeFilters: Array<[string, CellValue | null]> = [
        ['Country', filters.countryId === null ? null : countryValue],
        ['Region', filters.region],
        ['Year', filters.year],
        ['Assessment type', filters.assessmentType],
        ['Phase', phase],
        ['Minimum cycles', filters.minimumCycles === null ? null : `${filters.minimumCycles}+`],
        ['Consideration', consideration?.label ?? null],
        ['High-priority component', filters.highPriorityComponent],
    ];
    activeFilters.forEach(([name, value]) => {
        if (value !== null) {
            rows.push([name, value]);
        }
    });
    return rows;
}

function mapDataSheet(state: FilteredDashboardState): DashboardWorkbookSheet {
    const rows = groupByCountry(state.processes).flatMap((group) => {
        const process = latestProcess(group.processes);
        if (!process) {
            return [];
        }
        return [[
            ...identityValues(group.processes),
            process.phaseDisplay ?? '',
            getProcessYear(process) ?? '',
            process.assessmentNumber,
        ]];
    });

    return {
        name: 'Map Data',
        columns: [
            ...IDENTITY_COLUMNS,
            'Current PER phase',
            'Cycle year',
            'Cycle iteration',
        ],
        rows,
    };
}

function assessmentTypeSheet(
    groups: ProcessGroup[],
    filters: DashboardFilterState,
): DashboardWorkbookSheet {
    const types = filters.assessmentType === null
        ? [...ASSESSMENT_TYPES]
        : ASSESSMENT_TYPES.filter((type) => type === filters.assessmentType);
    const cycleGroupsByType = types.map((type) => groups.map((group) => (
        group.processes.filter((process) => (
            (process.phase ?? 0) >= 2 && process.typeOfAssessmentName === type
        ))
    )));
    const maxCycles = cycleGroupsByType.map(maxCycle);
    const rows = groups
        .filter((group) => types.some((type) => group.processes.some((process) => (
            (process.phase ?? 0) >= 2 && process.typeOfAssessmentName === type
        ))))
        .map((group) => {
            const values: CellValue[] = [...identityValues(group.processes)];
            types.forEach((type, index) => {
                const processes = group.processes.filter((process) => (
                    (process.phase ?? 0) >= 2 && process.typeOfAssessmentName === type
                ));
                values.push(...cycleValues(processes, maxCycles[index] ?? 0));
            });
            return values;
        });

    return {
        name: 'Assessment Types',
        columns: [
            ...IDENTITY_COLUMNS,
            ...types.flatMap((type, index) => cycleColumns(type, maxCycles[index] ?? 0)),
        ],
        rows,
    };
}

function yearAndRegionSheet(groups: ProcessGroup[]): DashboardWorkbookSheet {
    const max = maxCycle(groups.map((group) => group.processes));
    return {
        name: 'Year and Region',
        columns: [...IDENTITY_COLUMNS, ...cycleColumns('', max)],
        rows: groups.map((group) => [
            ...identityValues(group.processes),
            ...cycleValues(group.processes, max),
        ]),
    };
}

function highPriorityComponentsSheet(groups: ProcessGroup[]): DashboardWorkbookSheet {
    const rows = groups.flatMap((group) => {
        const process = latestProcess(group.processes);
        const components = process?.prioritizedComponents
            .map((component) => component.componentTitle)
            .filter((component): component is string => component !== null);
        if (!process || !components || components.length === 0) {
            return [];
        }
        return [[
            ...identityValues(group.processes),
            process.assessmentNumber,
            getProcessYear(process) ?? '',
            Array.from(new Set(components)).join('; '),
        ]];
    });
    return {
        name: 'High Priority Components',
        columns: [
            ...IDENTITY_COLUMNS,
            'Cycle',
            'Cycle year',
            'High Priority Components',
        ],
        rows,
    };
}

function considerationsSheet(
    groups: ProcessGroup[],
    filters: DashboardFilterState,
): DashboardWorkbookSheet {
    const considerations = filters.consideration === null
        ? CONSIDERATIONS
        : CONSIDERATIONS.filter((item) => item.key === filters.consideration);
    const cycleGroupsByConsideration = considerations.map((consideration) => groups.map((group) => (
        group.processes.filter((process) => (
            (process.phase ?? 0) >= 2 && process[consideration.field] === true
        ))
    )));
    const maxCycles = cycleGroupsByConsideration.map(maxCycle);
    const rows = groups
        .filter((group) => considerations.some((consideration) => (
            group.processes.some((process) => (
                (process.phase ?? 0) >= 2 && process[consideration.field] === true
            ))
        )))
        .map((group) => {
            const values: CellValue[] = [...identityValues(group.processes)];
            considerations.forEach((consideration, index) => {
                const processes = group.processes.filter((process) => (
                    (process.phase ?? 0) >= 2 && process[consideration.field] === true
                ));
                values.push(...cycleValues(processes, maxCycles[index] ?? 0));
            });
            return values;
        });
    const columns = considerations.flatMap((consideration, index) => (
        cycleColumns(consideration.label, maxCycles[index] ?? 0)
    ));
    return {
        name: 'PER Considerations',
        columns: [
            ...IDENTITY_COLUMNS,
            ...columns,
        ],
        rows,
    };
}

export function getDashboardWorkbookData(
    state: FilteredDashboardState,
    filters: DashboardFilterState,
): DashboardWorkbookData {
    const groups = scopedProcessGroups(state, filters);
    return {
        nationalSocietyCount: groups.length,
        sheets: [
            {
                name: 'Filters and Summary',
                columns: ['Filter', 'Value'],
                rows: filterSummaryRows(groups, filters),
            },
            mapDataSheet(state),
            assessmentTypeSheet(groups, filters),
            yearAndRegionSheet(groups),
            highPriorityComponentsSheet(groups),
            considerationsSheet(groups, filters),
        ],
    };
}

function safeCellValue(value: CellValue): CellValue {
    if (typeof value !== 'string') {
        return value;
    }
    // Excel rejects ASCII control characters.
    // eslint-disable-next-line no-control-regex
    const sanitized = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    return /^[=+\-@]/.test(sanitized) ? `'${sanitized}` : sanitized;
}

function columnWidth(column: string, rows: CellValue[][], index: number): number {
    const longest = Math.max(
        column.length,
        ...rows.map((row) => String(row[index] ?? '').length),
    );
    return Math.min(Math.max(longest + 2, 12), 40);
}

export async function downloadDashboardWorkbook(data: DashboardWorkbookData): Promise<void> {
    const { default: xlsx } = await import('exceljs');
    const workbook = new xlsx.Workbook();
    workbook.creator = 'IFRC GO';

    data.sheets.forEach((sheetData) => {
        const sheet = workbook.addWorksheet(sheetData.name);
        sheet.addRow(sheetData.columns.map(safeCellValue));
        sheetData.rows.forEach((row) => sheet.addRow(row.map(safeCellValue)));
        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: Math.max(sheetData.rows.length + 1, 1), column: sheetData.columns.length },
        };
        sheetData.columns.forEach((column, index) => {
            sheet.getColumn(index + 1).width = columnWidth(column, sheetData.rows, index);
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);
    FileSaver.saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `per-global-summary-filtered-dashboard-${date}.xlsx`,
    );
}
