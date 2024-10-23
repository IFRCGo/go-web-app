import { listToMap } from '@togglecorp/fujs';

import {
    getDuplicateItems,
    getTranslationFileNames,
    readTranslations,
    writeFilePromisify,
} from '../utils';

function lowercaseFirstChar(chars: string) {
    return chars.charAt(0).toLowerCase() + chars.slice(1);
}

async function lint(
    projectPath: string,
    translationFileName: string[],
    fix: boolean | undefined,
) {
    const fileNames = await getTranslationFileNames(projectPath, translationFileName);
    const { translations, filesContents } = await readTranslations(fileNames);

    const namespaces = new Set(translations.map((item) => item.namespace));

    console.info(`Found ${namespaces.size} namespaces.`);
    console.info(`Found ${translations.length} strings.`);

    const duplicates = getDuplicateItems(
        translations,
        (string) => `${string.namespace}:${string.key}`,
    );

    if (duplicates.length > 0) {
        console.info(JSON.stringify(duplicates, null, 2));
        throw `Found ${duplicates.length} duplicated strings.`;
    }

    // FIXME: We should get these custom rules from config file later
    const customRules: {
        location: string,
        namespace: ((match: RegExpMatchArray) => string) | string;
    }[] = [
        { location: '.*/app/src/views/(\\w+)/(?:.*/)?i18n.json$', namespace: (match) => lowercaseFirstChar(match[1]) },
        { location: '.*/app/src/components/domain/(\\w+)/(?:.*/)?i18n.json$', namespace: (match) => lowercaseFirstChar(match[1]) },
        { location: '.*/app/src/.*/i18n.json$', namespace: 'common' },
        { location: '.*/packages/ui/src/.*/i18n.json$', namespace: 'common' },
    ];

    const namespaceErrors: {
        fileName: string,
        expectedNamespace: string,
        receivedNamespace: string,
    }[] = [];
    for (const item of filesContents) {
        const { file: fileName, content: { namespace } } = item;
        for (const rule of customRules) {
            const match = fileName.match(new RegExp(rule.location));
            if (match) {
                const correctNamespace = typeof rule.namespace === 'string'
                    ? rule.namespace
                    : rule.namespace(match);
                if (correctNamespace !== namespace) {
                    namespaceErrors.push({
                        fileName,
                        expectedNamespace: correctNamespace,
                        receivedNamespace: namespace,
                    })
                }
                break;
            }
        };
    };

    if (namespaceErrors.length > 0) {
        if (fix) {
            const metadataMapping = listToMap(
                filesContents,
                (fileContents) => fileContents.file,
                (fileContents) => fileContents.content,
            );
            const updates = namespaceErrors.map((namespaceError) => {
                const content = metadataMapping[namespaceError.fileName];
                const updatedContent = {
                    ...content,
                    namespace: namespaceError.expectedNamespace,
                }
                return writeFilePromisify(
                    namespaceError.fileName,
                    JSON.stringify(updatedContent, null, 4),
                    'utf8',
                );
            });
            await Promise.all(updates);
            console.info(`Fixed namespace in ${namespaceErrors.length} files`);
        } else {
            console.info(JSON.stringify(namespaceErrors, null, 2));
            throw `Found ${namespaceErrors.length} issues with namespaces.`;
        }
    }

    // TODO: Throw error
    // - if the naming of migration files is not correct
    // - if the parent field is not correct
    // - if we have duplicates
}

export default lint;
