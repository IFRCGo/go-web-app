import { readFileSync } from "fs";

// FIXME: get this from params
const applicationId = 18;

function resolveUrl(from: string, to: string) {
    const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
    if (resolvedUrl.protocol === 'resolve:') {
        const { pathname, search, hash } = resolvedUrl;
        return pathname + search + hash;
    }
    return resolvedUrl.toString();
}

async function fetchTranslations(ifrcApiUrl: string, ifrcApiKey: string) {
    const endpoint = resolveUrl(ifrcApiUrl, `Application/${applicationId}/Translation/export`);

    const headers: RequestInit['headers'] = {
        // 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // 'Accept': 'application/octet-stream',
        'X-API-KEY': ifrcApiKey,
    }

    const promise = fetch(
        endpoint,
        {
            method: 'GET',
            headers,
        }
    );

    return promise;
}

async function fullAppImport(importFilePath: string, ifrcApiUrl: string, ifrcApiKey: string) {
    const endpoint = resolveUrl(ifrcApiUrl, `Application/${applicationId}/Translation/fullappimport`);
    const translationFile = readFileSync(importFilePath);
    const uint8FileData = new Uint8Array(translationFile);
    const blob = new Blob([uint8FileData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const formData = new FormData();
    formData.append('files', blob, 'translations.xlsx');

    const headers: RequestInit['headers'] = {
        'Accept': 'application/json',
        'X-API-KEY': ifrcApiKey,
    }

    const promise = fetch(
        endpoint,
        {
            method: 'POST',
            headers,
            body: formData,
        }
    );

    return promise;
}

async function pushStringsFromExcelToIfrc(importFilePath: string, apiUrl: string, apiKey: string) {
    const response = await fullAppImport(importFilePath, apiUrl, apiKey);

    try {
        const responseJson = await response.json();
        console.info(responseJson);
    } catch(e) {
        console.info(e);
        const responseText = await response.text();
        console.info(responseText);
    }
}

export default pushStringsFromExcelToIfrc;
