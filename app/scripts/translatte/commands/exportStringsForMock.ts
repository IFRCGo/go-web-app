import xlsx from 'exceljs';
import { read as readXlsxData, utils as xlsxUtils } from 'xlsx';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import { Language } from '../types';
import {
    getTranslationFileNames,
    languages,
    readTranslations,
    resolveUrl,
} from '../utils';

type ServiceValues = Partial<Record<Language, string>>;

async function fetchIfrcExport(
    apiUrl: string,
    apiKey: string,
    applicationId: string,
) {
    const endpoint = resolveUrl(apiUrl, `api/Application/${applicationId}/Translation/export`);

    const response = await fetch(
        endpoint,
        {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
            },
        },
    );

    if (!response.ok) {
        // Include the body: the service explains rejections there
        // (e.g. "Endpoint not allowed" when /api is missing from --api-url)
        const body = await response.text();
        throw `Failed to download IFRC translation export: ${response.status} ${response.statusText}: ${body.slice(0, 200)}`;
    }

    return response.arrayBuffer();
}

function cellToString(cell: unknown) {
    if (isNotDefined(cell)) {
        return undefined;
    }

    const value = String(cell).trim();
    return value === '' ? undefined : value;
}

// Reads the service export into a `page:key` -> { fr, es, ar, ... } lookup.
// The export has a "Translations" sheet with a `page | key | <language>...`
// header row (the format cacheppuccino parses). Parsed with SheetJS instead
// of exceljs: the service writes OPC relationships with absolute targets,
// which exceljs fails to load.
function readServiceStrings(data: ArrayBuffer) {
    const workbook = readXlsxData(new Uint8Array(data), { type: 'array' });

    const sheetName = workbook.SheetNames.includes('Translations')
        ? 'Translations'
        : workbook.SheetNames[0];
    if (isNotDefined(sheetName)) {
        throw 'IFRC translation export has no sheets';
    }

    const rows: unknown[][] = xlsxUtils.sheet_to_json(
        workbook.Sheets[sheetName],
        { header: 1 },
    );
    const [headerRow, ...dataRows] = rows;
    if (isNotDefined(headerRow)) {
        throw 'IFRC translation export is empty';
    }

    const header = headerRow.map((cell) => cellToString(cell)?.toLowerCase());
    const pageIndex = header.indexOf('page');
    const keyIndex = header.indexOf('key');
    if (pageIndex === -1 || keyIndex === -1) {
        throw 'IFRC translation export is missing the page/key columns';
    }

    const languageIndices = languages
        .map((language) => ({ language, index: header.indexOf(language) }))
        .filter(({ index }) => index !== -1);

    const serviceStrings = new Map<string, ServiceValues>();

    dataRows.forEach((row) => {
        const page = cellToString(row[pageIndex]);
        const key = cellToString(row[keyIndex]);

        if (isNotDefined(page) || isNotDefined(key)) {
            return;
        }

        // The export carries a metadata row (__meta/lastClientMigration)
        if (page === '__meta') {
            return;
        }

        const values: ServiceValues = {};
        languageIndices.forEach(({ language, index }) => {
            const value = cellToString(row[index]);
            if (isDefined(value)) {
                values[language] = value;
            }
        });

        serviceStrings.set(`${page}:${key}`, values);
    });

    return serviceStrings;
}

/**
 * Exports the local i18n.json strings as an XLSX in the IFRC translation
 * service export format (the format cacheppuccino imports). The local files
 * define which strings exist and their English values; fr/es/ar values are
 * filled in from the service export where available.
 */
async function exportStringsForMock(
    basePath: string,
    translationFileGlobs: string[],
    apiUrl: string,
    apiKey: string,
    applicationId: string,
    outputFileName = 'translations',
) {
    const fileNames = await getTranslationFileNames(basePath, translationFileGlobs);
    const { translations } = await readTranslations(fileNames);

    // Last one wins for duplicate namespace:key pairs, matching how
    // cacheppuccino imports duplicate rows. `translatte lint` reports these.
    const localStrings = new Map<string, { namespace: string, key: string, value: string }>();
    translations.forEach(({ namespace, key, value }) => {
        localStrings.set(`${namespace}:${key}`, { namespace, key, value });
    });
    const duplicateCount = translations.length - localStrings.size;

    console.info(`Read ${localStrings.size} strings from ${fileNames.length} translation files`);
    if (duplicateCount > 0) {
        console.warn(`Found ${duplicateCount} duplicate namespace:key pairs (last one wins)`);
    }

    const serviceStrings = readServiceStrings(await fetchIfrcExport(apiUrl, apiKey, applicationId));
    console.info(`Read ${serviceStrings.size} strings from the IFRC translation export`);

    const rows = [...localStrings.values()]
        .sort((a, b) => (
            a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key)
        ))
        .map(({ namespace, key, value }) => {
            const serviceValues = serviceStrings.get(`${namespace}:${key}`);

            return {
                page: namespace,
                key,
                // Local i18n files are the source of truth for English
                en: value,
                fr: serviceValues?.fr,
                es: serviceValues?.es,
                ar: serviceValues?.ar,
            };
        });

    const translatedCounts = (['fr', 'es', 'ar'] as const).map((language) => (
        `${language}: ${rows.filter((row) => isDefined(row[language])).length}`
    ));
    console.info(`Translations filled from the service: ${translatedCounts.join(', ')}`);

    const emptyEnglishCount = rows.filter((row) => row.en.trim() === '').length;
    if (emptyEnglishCount > 0) {
        console.warn(`${emptyEnglishCount} local strings have an empty English value; the cache server skips empty cells on import`);
    }

    const serviceOnlyCount = [...serviceStrings.keys()]
        .filter((serviceKey) => !localStrings.has(serviceKey))
        .length;
    if (serviceOnlyCount > 0) {
        console.warn(`Skipped ${serviceOnlyCount} service strings that no longer exist locally`);
    }

    const workbook = new xlsx.Workbook();
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Translations');
    worksheet.columns = [
        { header: 'page', key: 'page' },
        { header: 'key', key: 'key' },
        { header: 'en', key: 'en' },
        { header: 'fr', key: 'fr' },
        { header: 'es', key: 'es' },
        { header: 'ar', key: 'ar' },
    ];

    rows.forEach((row) => {
        worksheet.addRow(row);
    });

    const outputFilePath = outputFileName.endsWith('.xlsx')
        ? outputFileName
        : `${outputFileName}.xlsx`;
    await workbook.xlsx.writeFile(outputFilePath);
    console.info(`Wrote ${rows.length} strings to ${outputFilePath}`);
}

export default exportStringsForMock;
