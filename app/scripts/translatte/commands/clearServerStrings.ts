import { listToGroupList } from "@togglecorp/fujs";
import { fetchServerState, postLanguageStrings, writeFilePromisify } from "../utils";

async function clearServerStrings(apiUrl: string, authToken: string) {
    const serverStrings = await fetchServerState(apiUrl, authToken);

    const bulkActions = listToGroupList(
        serverStrings,
        ({ language }) => language,
        ({ key, page_name }) => ({
            action: "delete" as const,
            key,
            page_name,
        }),
    );

    const logs: {
        responseFor: string,
        response: object,
    }[] = [];

    console.log('Pusing delete actions for en...')
    const enResponse = await postLanguageStrings(
        'en',
        bulkActions.en,
        apiUrl,
        authToken,
    );

    const enResponseJson = await enResponse.json();
    logs.push({ responseFor: 'en', response: enResponseJson });


    console.log('Pusing delete actions for fr...')
    const frResponse = await postLanguageStrings(
        'fr',
        bulkActions.fr,
        apiUrl,
        authToken,
    );

    const frResponseJson = await frResponse.json();
    logs.push({ responseFor: 'fr', response: frResponseJson });

    console.log('Pusing delete actions for es...')
    const esResponse = await postLanguageStrings(
        'es',
        bulkActions.es,
        apiUrl,
        authToken,
    );
    const esResponseJson = await esResponse.json();
    logs.push({ responseFor: 'es', response: esResponseJson });

    console.log('Pusing delete actions for ar...')
    const arResponse = await postLanguageStrings(
        'ar',
        bulkActions.ar,
        apiUrl,
        authToken,
    );

    const arResponseJson = await arResponse.json();
    logs.push({ responseFor: 'ar', response: arResponseJson });

    await writeFilePromisify(
        '/tmp/clear-server-strings-log.json',
        JSON.stringify(logs, null, 2),
        'utf8',
    );
}

export default clearServerStrings;
