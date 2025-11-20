import xlsx, { CellValue } from 'exceljs';
import { encodeDate, isDefined, isFalsyString, isNotDefined, isTruthyString, listToGroupList, listToMap } from "@togglecorp/fujs";
import { fetchServerState, getTranslationFileNames, readTranslations, writeFilePromisify } from "../utils";
import { Md5 } from "ts-md5";

function getValueFromCellValue(cellValue: CellValue) {
    if (isNotDefined(cellValue)) {
        return undefined;
    }

    if (
        typeof cellValue === 'number'
        || typeof cellValue === 'string'
        || typeof cellValue === 'boolean'
    ) {
        return cellValue;
    }

    if (cellValue instanceof Date) {
        return encodeDate(cellValue);
    }

    if ('error' in cellValue) {
        return undefined;
    }

    if ('richText' in cellValue) {
        return cellValue.richText.map(({ text }) => text).join('');
    }

    if ('hyperlink' in cellValue) {
        const MAIL_IDENTIFIER = 'mailto:';
        if (cellValue.hyperlink.startsWith(MAIL_IDENTIFIER)) {
            return cellValue.hyperlink.substring(MAIL_IDENTIFIER.length);
        }

        return cellValue.hyperlink;
    }

    if (isNotDefined(cellValue.result)) {
        return undefined;
    }

    if (typeof cellValue.result === 'object' && 'error' in cellValue.result) {
        return undefined;
    }

    // Formula result
    return getValueFromCellValue(cellValue.result);
}

export function isTranslatedTemplateValid(
    source: string,
    translation: string,
): boolean {
    const extract = (s: string): Set<string> => {
        const set = new Set<string>();
        const re = /\{([^{}]+)\}/g;
        let match: RegExpExecArray | null;

        while ((match = re.exec(s)) !== null) {
            const key = match[1].trim();
            if (key) set.add(key);
        }
        return set;
    };

    const sourceVars = extract(source);
    const translationVars = extract(translation);

    if (sourceVars.size !== translationVars.size) return false;

    for (const v of sourceVars) {
        if (!translationVars.has(v)) return false;
    }

    return true;
}

async function createExcel(
    items: {
        key: string,
        namespace: string,
        en: string,
        fr: string | undefined,
        es: string | undefined,
        ar: string | undefined,
    }[]
) {
    const workbook = new xlsx.Workbook();
    const now = new Date();
    workbook.created = now;

    const yyyy = now.getFullYear();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const HH = now.getHours().toString().padStart(2, '0');
    const MM = now.getMinutes().toString().padStart(2, '0');

    const worksheet = workbook.addWorksheet(
        `${yyyy}-${mm}-${dd} ${HH}-${MM}`
    );

    worksheet.columns = [
        { header: 'Namespace', key: 'namespace' },
        { header: 'Key', key: 'key' },
        { header: 'EN', key: 'en' },
        { header: 'FR', key: 'fr' },
        { header: 'ES', key: 'es' },
        { header: 'AR', key: 'ar' },
    ];

    items.forEach((item) => {
        const itemSafe = {};

        for (const [key, value] of Object.entries(item)) {
            if (isTruthyString(value)) {
                itemSafe[key] = value;
            }
        }

        worksheet.addRow(itemSafe);
    });

    const fileName = `go-strings-${yyyy}-${mm}-${dd}`;

    await workbook.xlsx.writeFile(`${fileName}.xlsx`);
}

async function testExcel(
    importFilePath: string,
    projectPath: string,
    translationFileNames: string[],
    apiUrl: string,
    accessToken?: string,
) {
    const workbook = new xlsx.Workbook();
    await workbook.xlsx.readFile(importFilePath);

    const firstSheet = workbook.worksheets[0];
    const columns = firstSheet.columns.map(
        (column) => {
            const key = column.values?.[1]?.toString();
            if (isNotDefined(key)) {
                return undefined;
            }
            return { key, column: column.number }
        }
    ).filter(isDefined);

    const columnMap = listToMap(
        columns,
        ({ key }) => key,
        ({ column }) => column,
    );

    const xlsxRowsHashMap: Record<string, {
        en: string,
        fr: string | undefined,
        es: string | undefined,
        ar: string | undefined,
    }> = {
    };

    firstSheet.eachRow((row, i) => {
        if (i === 0) {
            return;
        }

        const enColumnKey = columnMap['EN'];
        const frColumnKey = columnMap['FR'];
        const esColumnKey = columnMap['ES'];
        const arColumnKey = columnMap['AR'];

        const enValue = isDefined(enColumnKey) ? getValueFromCellValue(row.getCell(enColumnKey).value) : undefined;
        const frValue = isDefined(frColumnKey) ? getValueFromCellValue(row.getCell(frColumnKey).value) : undefined;
        const esValue = isDefined(esColumnKey) ? getValueFromCellValue(row.getCell(esColumnKey).value) : undefined;
        const arValue = isDefined(arColumnKey) ? getValueFromCellValue(row.getCell(arColumnKey).value) : undefined;

        const hash = isDefined(enValue) ? Md5.hashStr(String(enValue)) : undefined;

        if (isDefined(hash) && isDefined(enValue)) {
            xlsxRowsHashMap[hash] = {
                en: String(enValue),
                fr: isDefined(frValue) ? String(frValue) : undefined,
                es: isDefined(esValue) ? String(esValue) : undefined,
                ar: isDefined(arValue) ? String(arValue) : undefined,
            }
        }
    });

    const translationFiles = await getTranslationFileNames(
        projectPath,
        Array.isArray(translationFileNames) ? translationFileNames : [],
    );

    const { translations } = await readTranslations(translationFiles);

    const fileState = translations.map((item) => ({
        ...item,
        hash: Md5.hashStr(item.value),
    }));

    const hashGroupedFileStateMapping = listToGroupList(
        fileState,
        ({ hash }) => hash,
    );

    const hashKeys = Object.keys(hashGroupedFileStateMapping);
    const newStrings = hashKeys.flatMap((hash) => {
        const strings = hashGroupedFileStateMapping[hash];
        const xlsxString = xlsxRowsHashMap[hash];

        return strings.map((stringItem) => ({
            key: stringItem.key,
            namespace: stringItem.namespace,
            en: stringItem.value,
            fr: xlsxString?.fr,
            es: xlsxString?.es,
            ar: xlsxString?.ar,
        }));
    });

    await createExcel(newStrings);

    /*
    await writeFilePromisify(
        `/tmp/local-strings-logs.json`,
        JSON.stringify(newStrings, null, 2),
        'utf8',
    );
    */
}

export default testExcel;
