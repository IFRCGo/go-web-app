import { isDefined, listToGroupList } from "@togglecorp/fujs";
import { isValidSourceStringItem, postLanguageStrings, readJsonSource } from "../utils";
import { Language, SourceStringItem } from "../types";

async function postSourceStrings(language: Language, strings: SourceStringItem[], apiUrl: string, authToken: string) {
    const response = await postLanguageStrings(
        language,
        strings.filter(isValidSourceStringItem).map(
            (sourceItem) => ({
                action: 'set',
                key: sourceItem.key,
                page_name: sourceItem.page_name,
                value: sourceItem.value,
                hash: sourceItem.hash,
            })
        ),
        apiUrl,
        authToken,
    );

    if (response.ok) {
        console.info(`${language} pushed to server`);
    } else {
        console.info(response.status, response.statusText);
        /*
        const responseJson = await response.json();
        await writeFileAsync(
            'server-error.json',
            JSON.stringify(responseJson, null, 2),
            'utf-8'
        );
        */
    }
}

async function uploadJson(jsonFilePath: string, apiUrl: string, authToken: string) {
    const { content: strings } = await readJsonSource(jsonFilePath);

    const languageGroupedStringMap = listToGroupList(
        strings,
        ({ language }) => language,
    );

    if (isDefined(languageGroupedStringMap.en)) {
        await postSourceStrings(
            'en',
            languageGroupedStringMap.en,
            apiUrl,
            authToken,
        );

    }

    if (isDefined(languageGroupedStringMap.fr)) {
        await postSourceStrings(
            'fr',
            languageGroupedStringMap.fr,
            apiUrl,
            authToken,
        );
    }

    if (isDefined(languageGroupedStringMap.es)) {
        await postSourceStrings(
            'es',
            languageGroupedStringMap.es,
            apiUrl,
            authToken,
        );
    }

    if (isDefined(languageGroupedStringMap.ar)) {
        await postSourceStrings(
            'ar',
            languageGroupedStringMap.ar,
            apiUrl,
            authToken,
        );
    }
}

export default uploadJson;
