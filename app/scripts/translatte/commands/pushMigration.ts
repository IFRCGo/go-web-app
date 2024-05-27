import { isDefined, isNotDefined, listToGroupList, listToMap, mapToMap } from "@togglecorp/fujs";
import { Language, MigrationActionItem, SourceStringItem } from "../types";
import { fetchLanguageStrings, getCombinedKey, postLanguageStrings, readMigrations } from "../utils";
import { Md5 } from "ts-md5";

const languages: Language[] = ['en', 'fr', 'es', 'ar'];

async function fetchServerState(apiUrl: string, authToken: string) {
    const responsePromises = languages.map(
        (language) => fetchLanguageStrings(language, apiUrl, authToken)
    );

    const responses = await Promise.all(responsePromises);

    const languageJsonPromises = responses.map(
        (response) => response.json()
    );

    const languageStrings = await Promise.all(languageJsonPromises);

    const serverStrings = languageStrings.flatMap(
        (languageString) => {
            const language: Language = languageString.code;

            const strings: SourceStringItem[] = languageString.strings.map(
                (string: Omit<SourceStringItem, 'language'>) => ({
                    ...string,
                    language,
                })
            )

            return strings;
        }
    );

    return serverStrings;
}

async function pushMigration(migrationFilePath: string, apiUrl: string, authToken: string) {
    const serverStrings = await fetchServerState(apiUrl, authToken);

    const serverStringMapByCombinedKey = mapToMap(
        listToGroupList(
            serverStrings,
            ({ key, page_name }) => getCombinedKey(key, page_name),
        ),
        (key) => key,
        (list) => listToMap(
            list,
            ({ language }) => language,
        )
    );

    const migrations = await readMigrations(
        [migrationFilePath]
    );

    const actions = migrations[0].content.actions;


    function getItemsForNamespaceUpdate(actionItem: MigrationActionItem, language: Language) {
        if (actionItem.action !== 'update') {
            return undefined;
        }

        if (isNotDefined(actionItem.newNamespace)) {
            return undefined;
        }

        const oldCombinedKey = getCombinedKey(
            actionItem.key,
            actionItem.namespace,
        );

        const oldStringItem = serverStringMapByCombinedKey[oldCombinedKey]?.[language];

        if (isNotDefined(oldStringItem)) {
            return undefined;
        }

        return [
            {
                action: 'delete' as const,
                key: actionItem.key,
                page_name: actionItem.namespace,
            },
            {
                action: 'set' as const,
                key: actionItem.key,
                page_name: actionItem.newNamespace,
                value: oldStringItem.value,
                hash: oldStringItem.hash,
            },
        ];
    }

    function getItemsForKeyUpdate(actionItem: MigrationActionItem, language: Language) {
        if (actionItem.action !== 'update') {
            return undefined;
        }

        if (isNotDefined(actionItem.newKey)) {
            return undefined;
        }

        const oldCombinedKey = getCombinedKey(
            actionItem.key,
            actionItem.namespace,
        );

        const oldStringItem = serverStringMapByCombinedKey[oldCombinedKey]?.[language];

        if (isNotDefined(oldStringItem)) {
            return undefined;
        }

        return [
            {
                action: 'delete' as const,
                key: actionItem.key,
                page_name: actionItem.namespace,
            },
            {
                action: 'set' as const,
                key: actionItem.newKey,
                page_name: actionItem.namespace,
                value: oldStringItem.value,
                hash: oldStringItem.hash,
            },
        ];
    }

    const serverActions = languages.map((language) => {
        const serverActionsForCurrentLanguage = actions.flatMap((actionItem) => {
            if (language === 'en') {
                if (actionItem.action === 'add') {
                    return {
                        action: 'set' as const,
                        key: actionItem.key,
                        page_name: actionItem.namespace,
                        value: actionItem.value,
                        hash: Md5.hashStr(actionItem.value),
                    }
                }

                if (actionItem.action === 'remove') {
                    return {
                        action: 'delete' as const,
                        key: actionItem.key,
                        page_name: actionItem.namespace,
                    }
                }

                if (isDefined(actionItem.newNamespace)) {
                    return getItemsForNamespaceUpdate(actionItem, language);
                }

                if (isDefined(actionItem.newKey)) {
                    return getItemsForKeyUpdate(actionItem, language);
                }

                if (isDefined(actionItem.newValue)) {
                    return {
                        action: 'set' as const,
                        key: actionItem.key,
                        page_name: actionItem.namespace,
                        value: actionItem.newValue,
                        hash: Md5.hashStr(actionItem.newValue),
                    }
                }
            } else {
                if (actionItem.action === 'remove') {
                    return {
                        action: 'delete' as const,
                        key: actionItem.key,
                        page_name: actionItem.namespace,
                    }
                }

                if (actionItem.action === 'update') {
                    if (isDefined(actionItem.newNamespace)) {
                        return getItemsForNamespaceUpdate(actionItem, language);
                    }

                    if (isDefined(actionItem.newKey)) {
                        return getItemsForKeyUpdate(actionItem, language);
                    }
                }
            }

            return undefined;
        }).filter(isDefined);

        return {
            language,
            actions: serverActionsForCurrentLanguage,
        }
    });

    const postResponsePromises = serverActions.map(
        (serverAction) => postLanguageStrings(
            serverAction.language,
            serverAction.actions,
            apiUrl,
            authToken,
        )
    );

    await Promise.all(postResponsePromises);
}

export default pushMigration;
