import {
    getDuplicateItems,
    getTranslationFileNames,
    readTranslations,
} from '../utils';

async function lint(projectPath: string, translationFileName: string[]) {
    const fileNames = await getTranslationFileNames(projectPath, translationFileName);
    const translations = await readTranslations(fileNames);

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

    // TODO: Throw error
    // - if the naming of migration files is not correct
    // - if the parent field is not correct
    // - if we have duplicates
}

export default lint;
