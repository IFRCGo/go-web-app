import { isDefined, isFalsyString } from "@togglecorp/fujs";
import { fetchServerState, postLanguageStrings, writeFilePromisify } from "../utils";

async function syncEnStrings(sourceApiUrl: string, desinationApiUrl: string, authToken: string) {
    const serverStrings = await fetchServerState(sourceApiUrl, authToken);
    const enStrings = serverStrings.filter((string) => string.language === 'en');

    const actions = enStrings.map((string) => {
        if (isFalsyString(string.key) || isFalsyString(string.page_name) || isFalsyString(string.value)) {
            return undefined;
        }

        return {
            action: 'set' as const,
            key: string.key,
            page_name: string.page_name,
            value: string.value,
            hash: string.hash,
        };
    }).filter(isDefined);

    console.log("posting en actions...");
    const result = await postLanguageStrings(
        'en',
        actions,
        desinationApiUrl,
        authToken,
    )

    const resultJson = await result.json();
    console.info(resultJson);
    await writeFilePromisify(
        '/tmp/sync-en-strings-logs.json',
        JSON.stringify(resultJson, null, 2),
        'utf8',
    );
}

export default syncEnStrings;
