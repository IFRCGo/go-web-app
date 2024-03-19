import { listToMap, isDefined } from '@togglecorp/fujs';

import { MigrationActionItem, MigrationFileContent } from '../types';
import {
    concat,
    removeUndefinedKeys,
    getMigrationFilesAttrs,
    readMigrations,
    removeFiles,
    writeFilePromisify
} from '../utils';

function getCanonicalKey(
    item: MigrationActionItem,
    opts: { useNewKey: boolean },
) {
    if (opts.useNewKey && item.action === 'update') {
        return concat(
            item.newNamespace ?? item.namespace,
            item.newKey ?? item.key,
        );
    }
    return concat(
        item.namespace,
        item.key,
    );
}

function mergeMigrationActionItems(
    prevMigrationActionItems: MigrationActionItem[],
    nextMigrationActionItems: MigrationActionItem[],
) {
    interface PrevMappings {
        [key: string]: MigrationActionItem,
    }

    const prevCanonicalKeyMappings: PrevMappings = listToMap(
        prevMigrationActionItems,
        (item) => getCanonicalKey(item, { useNewKey: true }),
        (item) => item,
    );

    interface NextMappings {
        [key: string]: MigrationActionItem | null,
    }

    const nextMappings = nextMigrationActionItems.reduce<NextMappings>(
        (acc, nextMigrationActionItem) => {
            const canonicalKey = getCanonicalKey(nextMigrationActionItem, { useNewKey: false })

            const prevItemWithCanonicalKey = prevCanonicalKeyMappings[canonicalKey];
            // const prevItemWithKey = prevKeyMappings[nextMigrationActionItem.key];

            if (!prevItemWithCanonicalKey) {
                return {
                    ...acc,
                    [canonicalKey]: nextMigrationActionItem,
                };
            }

            if (prevItemWithCanonicalKey.action === 'add' && nextMigrationActionItem.action === 'add') {
                throw `Action 'add' already exists for '${canonicalKey}'`;
            }
            if (prevItemWithCanonicalKey.action === 'add' && nextMigrationActionItem.action === 'remove') {
                return {
                    ...acc,
                    [canonicalKey]: null,
                };
            }
            if (prevItemWithCanonicalKey.action === 'add' && nextMigrationActionItem.action === 'update') {
                const newKey = nextMigrationActionItem.newKey
                    ?? prevItemWithCanonicalKey.key;
                const newNamespace = nextMigrationActionItem.newNamespace
                    ?? prevItemWithCanonicalKey.namespace;

                const newMigrationItem = removeUndefinedKeys<MigrationActionItem>({
                    action: 'add',
                    namespace: newNamespace,
                    key: newKey,
                    value: nextMigrationActionItem.newValue
                        ?? prevItemWithCanonicalKey.value,
                });

                const newCanonicalKey = getCanonicalKey(newMigrationItem, { useNewKey: true });
                if (acc[newCanonicalKey] !== undefined && acc[newCanonicalKey] !== null) {
                    throw `Action 'update' cannot be applied to '${newCanonicalKey}' as the key already exists`;
                }

                return {
                    ...acc,
                    // Setting null so that we remove them on the mappings.
                    // No need to set null, if we have already overridden with other value
                    [canonicalKey]: acc[canonicalKey] === undefined || acc[canonicalKey] === null
                            ? null
                            : acc[canonicalKey],
                    [newCanonicalKey]: newMigrationItem,
                }
            }
            if (prevItemWithCanonicalKey.action === 'remove' && nextMigrationActionItem.action === 'add') {
                return {
                    ...acc,
                    [canonicalKey]: removeUndefinedKeys<MigrationActionItem>({
                        action: 'update',
                        namespace: prevItemWithCanonicalKey.namespace,
                        key: prevItemWithCanonicalKey.key,
                        newValue: nextMigrationActionItem.value,
                    })
                };
            }
            if (prevItemWithCanonicalKey.action === 'remove' && nextMigrationActionItem.action === 'remove') {
                // pass
                return acc;
            }
            if (prevItemWithCanonicalKey.action === 'remove' && nextMigrationActionItem.action === 'update') {
                throw `Action 'update' cannot be applied to '${canonicalKey}' after action 'remove'`;
            }
            if (prevItemWithCanonicalKey.action === 'update' && nextMigrationActionItem.action === 'add') {
                throw `Action 'add' cannot be applied to '${canonicalKey}' after action 'update'`;
            }
            if (prevItemWithCanonicalKey.action === 'update' && nextMigrationActionItem.action === 'update') {
                return {
                    ...acc,
                    [canonicalKey]: removeUndefinedKeys<MigrationActionItem>({
                        action: 'update',
                        namespace: prevItemWithCanonicalKey.namespace,
                        key: prevItemWithCanonicalKey.key,
                        newNamespace: nextMigrationActionItem.newNamespace ?? prevItemWithCanonicalKey.newNamespace,
                        newKey: nextMigrationActionItem.newKey ?? prevItemWithCanonicalKey.newKey,
                        newValue: nextMigrationActionItem.newValue ?? prevItemWithCanonicalKey.newValue,
                    }),
                };
            }
            if (prevItemWithCanonicalKey.action === 'update' && nextMigrationActionItem.action === 'remove') {
                return {
                    ...acc,
                    [canonicalKey]: removeUndefinedKeys<MigrationActionItem>({
                        action: 'remove',
                        namespace: prevItemWithCanonicalKey.namespace,
                        key: prevItemWithCanonicalKey.key,
                    }),
                };
            }
            return acc;
        },
        {},
    );

    const finalMappings = {
        ...prevCanonicalKeyMappings,
        ...nextMappings,
    };

    return Object.values(finalMappings).filter(isDefined);
}

export function merge(migrationFileContents: MigrationFileContent[]) {
    const migrationActionItems = migrationFileContents.reduce<MigrationActionItem[]>(
        (acc, migrationActionItem) => {
            const newMigrationItems = mergeMigrationActionItems(acc, migrationActionItem.actions)
            return newMigrationItems;
        },
        [],
    );

    return migrationActionItems;
}

async function mergeMigrations(
    projectPath: string,
    path: string,
    from: string,
    to: string,
    dryRun: boolean | undefined,
) {
    const migrationFilesAttrs = await getMigrationFilesAttrs(projectPath, path);
    const selectedMigrationFilesAttrs = migrationFilesAttrs.filter(
        (item) => (item.migrationName >= from && item.migrationName <= to)
    );
    console.info(`Found ${selectedMigrationFilesAttrs.length} migration files`);

    if (selectedMigrationFilesAttrs.length <= 1) {
        throw 'There should be atleast 2 migration files';
    }
    const selectedMigrations = await readMigrations(
        selectedMigrationFilesAttrs.map((migration) => migration.fileName),
    );

    const firstMigration= selectedMigrations[0];
    const lastMigration = selectedMigrations[selectedMigrations.length - 1];

    const selectedMigrationsFileNames = selectedMigrationFilesAttrs.map((migration) => migration.fileName);

    const mergedMigrationContent = {
        actions: merge(selectedMigrations.map((migration) => migration.content)),
        parent: firstMigration.content.parent,
    };

    if (dryRun) {
        console.info('Deleting the following migration files');
        console.info(selectedMigrationsFileNames);
    } else {
        await removeFiles(
            selectedMigrationsFileNames,
        );
    }

    const newFileName = lastMigration.file;
    if (dryRun) {
        console.info(`Creating migration file '${newFileName}'`);
        console.info(mergedMigrationContent);
    } else {
        await writeFilePromisify(
            newFileName,
            JSON.stringify(mergedMigrationContent, null, 4),
            'utf8',
        );
    }
}

export default mergeMigrations;
