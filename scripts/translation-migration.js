import Excel from 'exceljs';
import fg from 'fast-glob';
import { cwd, exit } from 'process';
import { join } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import { mapToList } from '@togglecorp/fujs';

function stringSimilarity(str1, str2, substringLength = 2, caseSensitive = false) {
    if (!caseSensitive) {
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();
    }

    if (str1.length < substringLength || str2.length < substringLength) {
        return 0;
    }

    const map = new Map();
    for (let i = 0; i < str1.length - (substringLength - 1); i++) {
        const substr1 = str1.substr(i, substringLength);
        map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
    }

    let match = 0;
    for (let j = 0; j < str2.length - (substringLength - 1); j++) {
        const substr2 = str2.substr(j, substringLength);
        const count = map.has(substr2) ? map.get(substr2) : 0;
        if (count > 0) {
            map.set(substr2, count - 1);
            match++;
        }
    }

    return (match * 2) / (str1.length + str2.length - ((substringLength - 1) * 2));
}

const glob = fg.glob;

const readFilePromisify = promisify(readFile);

const currentDir = cwd();
const fullPath = join(currentDir, 'src/**/i18n.json');

console.warn(`Searching on ${fullPath}`);

const files = await glob(
    fullPath,
    { ignore: ['node_modules'], absolute: true },
);

console.warn(`Found ${files.length} files.`);

const translationsPromise = files.map(async (file) => {
    const fileDescriptor = await readFilePromisify(file);
    const filename = `.${file.slice(currentDir.length)}`;
    try {
        return {
            file: filename,
            content: JSON.parse(fileDescriptor.toString()),
        };
    } catch (e) {
        console.error(`Error while parsing JSON for ${filename}`);
        exit(1);
    }
});

const translations = await Promise.all(translationsPromise);

const strings = translations.flatMap((translation) => {
    const { file, content } = translation;

    return mapToList(
        content.strings,
        (item, key) => ({
            file,
            namespace: content.namespace,
            key,
            value: item,
        }),
    );
});

console.warn(`Found ${strings.length} strings`);

const workbook = new Excel.Workbook();
await workbook.xlsx.readFile(join(currentDir, 'scripts/go-strings.xlsx'));

console.warn('Loaded xlsx');

const worksheet = workbook.worksheets[0];

const oldStrings = [];
worksheet.eachRow(
    (row) => {
        const strKey = row.getCell(1).value;
        const dev = row.getCell(2).value;
        const fr = row.getCell(4).value;
        const es = row.getCell(5).value;
        const ar = row.getCell(6).value;

        oldStrings.push({
            id: strKey,
            dev,
            fr,
            es,
            ar,
        });
    }
)

console.warn(`Found ${oldStrings.length} old strings `);

const migratedStrings = strings.map(
    (string) => {
        const {
            value,
            key,
        } = string;

        const nearMatches = oldStrings.filter(
            ({ dev }) => (
                stringSimilarity(dev, value) > 0.9
            )
        );

        const exactMatchIndex = nearMatches.findIndex(({ id }) => id === key);
        const match = exactMatchIndex === -1
            ? nearMatches.slice(0, 1)
            : nearMatches.slice(exactMatchIndex, exactMatchIndex + 1);

        return {
            ...string,
            oldMatch: match[0],
        };
    },
);

console.log(JSON.stringify(migratedStrings, null, 2));
