import { join } from 'path';

import { fetchAllServerStrings, writeFileAsync } from "../utils";

async function exportStrings(
    apiUrl: string,
    outputDir: string,
) {
    const serverStrings = await fetchAllServerStrings(apiUrl);

    const url = new URL(apiUrl);
    const now = new Date();
    const exportFileName = `${url.hostname}-${now.getTime()}.json`;
    const exportFilePath = join(outputDir, exportFileName);

    await writeFileAsync(
        exportFilePath,
        JSON.stringify(serverStrings, null, 2),
        'utf8',
    );
}

export default exportStrings;
