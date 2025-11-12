import { isDefined, isFalsyString, isNotDefined, listToGroupList, listToMap, mapToMap } from "@togglecorp/fujs";
import { Language, MigrationActionItem, ServerActionItem } from "../types";
import { fetchServerState, getCombinedKey, languages, postLanguageStrings, readMigrations, writeFilePromisify } from "../utils";
import { Md5 } from "ts-md5";

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

        if (isNotDefined(oldStringItem) || isFalsyString(oldStringItem.value)) {
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

        if (isNotDefined(oldStringItem) || isFalsyString(oldStringItem.value)) {
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

    const serverActions = listToMap(
        languages.map((language) => {
            const serverActionsForCurrentLanguage = actions.flatMap((actionItem) => {
                if (language === 'en') {
                    if (actionItem.action === 'add') {
                        if (isFalsyString(actionItem.value)) {
                            return undefined;
                        }

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
        }),
        ({ language }) => language,
    );

    await writeFilePromisify(
        `/tmp/server-actions.json`,
        JSON.stringify(serverActions, null, 2),
        'utf8',
    );

    const logs: {
        responseFor: string,
        response: object,
    }[] = [];

    async function applyAction(lang: Language, actions: ServerActionItem[]) {
        console.log(`Pusing actions for ${lang}...`)
        const response = await postLanguageStrings(
            lang,
            actions,
            apiUrl,
            authToken,
        );
        const responseJson = await response.json();
        logs.push({ responseFor: 'en', response: responseJson });

        /*
        const setActions = actions.filter(({ action }) => action === 'set');
        const deleteActions = actions.filter(({ action }) => action === 'delete');

        console.log(`Pushing deleted actions for ${lang}...`)
        const deleteResponse = await postLanguageStrings(
            lang,
            deleteActions,
            apiUrl,
            authToken,
        );
        const deleteResponseJson = await deleteResponse.json();
        logs.push({ responseFor: 'delete en', response: deleteResponseJson });

        console.log(`Pusing set actions for ${lang}...`)
        const setResponse = await postLanguageStrings(
            lang,
            setActions,
            apiUrl,
            authToken,
        );
        const setResponseJson = await setResponse.json();
        logs.push({ responseFor: 'set en', response: setResponseJson });
        */
    }

    await applyAction(serverActions.en.language, serverActions.en.actions);
    await applyAction(serverActions.fr.language, serverActions.fr.actions);
    await applyAction(serverActions.es.language, serverActions.es.actions);
    await applyAction(serverActions.ar.language, serverActions.ar.actions);

    await writeFilePromisify(
        `/tmp/push-migration-logs.json`,
        JSON.stringify(logs, null, 2),
        'utf8',
    );
}

export default pushMigration;
