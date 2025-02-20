import { Md5 } from 'ts-md5';
import { join, isAbsolute } from 'path';

import {
    writeFilePromisify,
    oneOneMapping,
    readTranslations,
    getTranslationFileNames,
    getMigrationFilesAttrs,
    readMigrations,
    oneOneMappingNonUnique,
} from '../utils';
import { MigrationActionItem, MigrationFileContent } from '../types';
import { merge } from './mergeMigrations';

function getCombinedKey(key: string, namespace: string) {
    return `${namespace}:${key}`;
}

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
    /*
    console.info('prevState length', prevState.length);
    console.info('currentState length', currentState.length);
    console.info('Total change', Math.abs(prevState.length - currentState.length));
    */

    const {
        // Same, key, namespace and same value
        validCommonItems: identicalStateItems,

        // Same, key, namespace but different value
        invalidCommonItems: valueUpdatedStateItems,

        // items with different key or namespace or both
        prevStateRemainder: potentiallyRemovedStateItems,

        // items with different key or namespace or both
        currentStateRemainder: potentiallyAddedStateItems,
    } = oneOneMapping(
        prevState,
        currentState,
        ({ key, namespace }) => getCombinedKey(key, namespace),
        (prev, current) => prev.value === current.value,
    );

    console.info(`Unchanged strings: ${identicalStateItems.length}`)
    console.info(`Value updated strings: ${valueUpdatedStateItems.length}`)

    console.info(`Potentially removed: ${potentiallyRemovedStateItems.length}`)
    console.info(`Potentially added: ${potentiallyAddedStateItems.length}`)

    const {
        commonItems: namespaceUpdatedStateItems,
        prevStateRemainder: potentiallyRemovedStateItemsAfterNamespaceChange,
        currentStateRemainder: potentiallyAddedStateItemsAfterNamespaceChange,
    } = oneOneMappingNonUnique(
        potentiallyRemovedStateItems,
        potentiallyAddedStateItems,
        (item) => getCombinedKey(item.key, Md5.hashStr(item.value)),
    );

    const {
        commonItems: keyUpdatedStateItems,
        prevStateRemainder: removedStateItems,
        currentStateRemainder: addedStateItems,
    } = oneOneMappingNonUnique(
        potentiallyRemovedStateItemsAfterNamespaceChange,
        potentiallyAddedStateItemsAfterNamespaceChange,
        (item) => getCombinedKey(item.namespace, Md5.hashStr(item.value)),
    );

    console.info(`Namespace updated strings: ${namespaceUpdatedStateItems.length}`)
    console.info(`Added strings: ${addedStateItems.length}`)
    console.info(`Removed strings: ${removedStateItems.length}`)

    return [
        ...valueUpdatedStateItems.map(({ prevStateItem, currentStateItem }) => ({
            action: 'update' as const,
            key: prevStateItem.key,
            namespace: prevStateItem.namespace,
            newValue: currentStateItem.value,
        })),
        ...namespaceUpdatedStateItems.map(({ prevStateItem, currentStateItem }) => ({
            action: 'update' as const,
            key: prevStateItem.key,
            namespace: prevStateItem.namespace,
            newNamespace: currentStateItem.namespace,
        })),
        ...keyUpdatedStateItems.map(({ prevStateItem, currentStateItem }) => ({
            action: 'update' as const,
            key: prevStateItem.key,
            newKey: currentStateItem.key,
            namespace: prevStateItem.namespace,
        })),
        ...addedStateItems.map((item) => ({
            action: 'add' as const,
            key: item.key,
            namespace: item.namespace,
            value: item.value,
        })),
        ...removedStateItems.map((item) => ({
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
    const { translations } = await readTranslations(translationFiles);
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
