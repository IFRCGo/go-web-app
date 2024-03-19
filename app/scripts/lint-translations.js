import { isDefined, listToMap, mapToList } from '@togglecorp/fujs';
import fg from 'fast-glob';
import { readFile } from 'fs';
import { join } from 'path';
import { cwd, exit } from 'process';
import { promisify } from 'util';

const glob = fg.glob;

const readFilePromisify = promisify(readFile);

function getDuplicates(
    list,
    keySelector,
) {
    if (!list) {
        return undefined;
    }
    const counts = listToMap(
        list,
        keySelector,
        (_, key, __, acc) => {
            const value = acc[key];
            return isDefined(value) ? value + 1 : 1;
        },
    );

    return list
        .filter((item) => counts[keySelector(item)] > 1)
        .sort((foo, bar) => keySelector(foo).localeCompare(keySelector(bar)));
}

const currentDir = cwd();
const fullPath = join(currentDir, 'src/**/i18n.json');
console.info('Searching in', fullPath);

const files = await glob(fullPath, { ignore: ['node_modules'], absolute: true });
console.info(`Found ${files.length} i18n.json files.`);

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

const namespaces = new Set(strings.map((item) => item.namespace));

console.info(`Found ${namespaces.size} namespaces.`);
console.info(`Found ${strings.length} strings.`);

const duplicates = getDuplicates(
    strings,
    (string) => `${string.namespace}:${string.key}`,
);

console.error(`Found ${duplicates.length} duplicated strings.`);
if (duplicates.length > 0) {
    console.info(JSON.stringify(duplicates, null, 2));
    exit(2);
}
