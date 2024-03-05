import { Md5 } from 'ts-md5';
import { join, isAbsolute } from 'path';

import {
    writeFilePromisify,
    oneOneMapping,
    readTranslations,
    getTranslationFileNames,
    getMigrationFilesAttrs,
    readMigrations,
} from '../utils';
import { MigrationActionItem, MigrationFileContent } from '../types';
import { merge } from './mergeMigrations';

type StateItem = {
    filename?: string;
    namespace: string;
    key: string;
    value: string;
}

// FIXME: The output should be stable
function generateMigration(
    prevState: StateItem[],
    currentState: StateItem[],
): MigrationActionItem[] {
    let unchangedPairs: [StateItem, StateItem][];
    ({
        match: unchangedPairs,
        leftRemainder: prevState,
        rightRemainder: currentState,
    } = oneOneMapping(
        prevState,
        currentState,
        (item) => `${item.namespace}:${item.key}`,
        (prev, current) => prev.value === current.value,
    ));

    console.info(`Unchaged strings: ${unchangedPairs.length}`)

    let updatedPairs: [StateItem, StateItem][];
    ({
        match: updatedPairs,
        leftRemainder: prevState,
        rightRemainder: currentState,
    } = oneOneMapping(
        prevState,
        currentState,
        (item) => `${item.namespace}:${item.key}`,
        (prev, current) => prev.value !== current.value,
    ));

    console.info(`Updated value strings: ${updatedPairs.length}`)

    let namespaceUpdatedPairs: [StateItem, StateItem][];
    ({
        match: namespaceUpdatedPairs,
        leftRemainder: prevState,
        rightRemainder: currentState,
    } = oneOneMapping(
        prevState,
        currentState,
        (item) => `${item.key}:${Md5.hashStr(item.value)}`,
        (prev, current) => prev.namespace !== current.namespace,
    ));

    console.info(`Updated namespace strings: ${namespaceUpdatedPairs.length}`)

    let keyUpdatedPairs: [StateItem, StateItem][];
    ({
        match: keyUpdatedPairs,
        leftRemainder: prevState,
        rightRemainder: currentState,
    } = oneOneMapping(
        prevState,
        currentState,
        (item) => `${item.namespace}:${Md5.hashStr(item.value)}`,
        (prev, current) => prev.key !== current.key,
    ));

    console.info(`Update key strings: ${keyUpdatedPairs.length}`)

    const addedItems = currentState;
    console.info(`Added strings: ${addedItems.length}`)

    const removedItems = prevState;
    console.info(`Removed strings: ${removedItems.length}`)

    return [
        ...updatedPairs.map(([prev, current]) => ({
            action: 'update' as const,
            key: prev.key,
            namespace: prev.namespace,
            newValue: current.value,
        })),
        ...namespaceUpdatedPairs.map(([prev, current]) => ({
            action: 'update' as const,
            key: prev.key,
            namespace: prev.namespace,
            // newKey: current.key,
            newNamespace: current.namespace,
        })),
        ...keyUpdatedPairs.map(([prev, current]) => ({
            action: 'update' as const,
            key: prev.key,
            namespace: prev.namespace,
            newKey: current.key,
            // newNamespace: current.namespace,
        })),
        ...addedItems.map((item) => ({
            action: 'add' as const,
            key: item.key,
            namespace: item.namespace,
            value: item.value,
        })),
        ...removedItems.map((item) => ({
            action: 'remove' as const,
            key: item.key,
            namespace: item.namespace,
        })),
    ].sort((foo, bar) => (
        foo.namespace.localeCompare(bar.namespace)
        || foo.action.localeCompare(bar.action)
        || foo.key.localeCompare(bar.key)
    ));
}

async function generate(
    projectPath: string,
    migrationFilePath: string,
    translationFileName: string | string[],
    timestamp: number,
    dryRun: boolean | undefined,
) {
    const migrationFilesAttrs = await getMigrationFilesAttrs(projectPath, migrationFilePath);
    const selectedMigrationFilesAttrs = migrationFilesAttrs;
    console.info(`Found ${selectedMigrationFilesAttrs.length} migration files`);
    const selectedMigrations = await readMigrations(
        selectedMigrationFilesAttrs.map((migration) => migration.fileName),
    );
    const mergedMigrationActions = merge(
        selectedMigrations.map((migration) => migration.content),
    );

    const serverState: StateItem[] = mergedMigrationActions.map((item) => {
        if (item.action !== 'add') {
            throw `The action should be "add" but found "${item.action}"`;
        }
        return {
            filename: undefined,
            namespace: item.namespace,
            key: item.key,
            value: item.value,
        }
    });

    const translationFiles = await getTranslationFileNames(
        projectPath,
        Array.isArray(translationFileName) ? translationFileName : [translationFileName],
    );
    const translations = await readTranslations(translationFiles);
    const fileState = translations.map((item) => ({
        ...item,
    }));

    const migrationActionItems = generateMigration(
        serverState,
        fileState,
    );

    if (migrationActionItems.length <= 0) {
        throw 'Nothing to do';
    }

    const lastMigration = migrationFilesAttrs[migrationFilesAttrs.length - 1];

    const migrationContent: MigrationFileContent = {
        parent: lastMigration?.migrationName,
        actions: migrationActionItems,
    }

    const num = String(Number(lastMigration?.num ?? '000000') + 1).padStart(6, '0');

    const outputMigrationFile = isAbsolute(migrationFilePath)
        ? join(migrationFilePath, `${num}-${timestamp}.json`)
        : join(projectPath, migrationFilePath, `${num}-${timestamp}.json`)

    if (dryRun) {
        console.info(`Creating migration file '${outputMigrationFile}'`);
        console.info(migrationContent);
    } else {
        await writeFilePromisify(
            outputMigrationFile,
            JSON.stringify(migrationContent, null, 4),
            'utf8',
        );
    }
}

export default generate;
