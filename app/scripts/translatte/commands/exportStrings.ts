import { join } from 'path';

import { fetchAllServerStrings, writeFilePromisify } from "../utils";

async function exportStrings(
    apiUrl: string,
    outputDir: string,
) {
    const serverStrings = await fetchAllServerStrings(apiUrl);

    const url = new URL(apiUrl);
    const now = new Date();
    const exportFileName = `${url.hostname}-${now.getTime()}.json`;
    const exportFilePath = join(outputDir, exportFileName);

    await writeFilePromisify(
        exportFilePath,
        JSON.stringify(serverStrings, null, 2),
        'utf8',
    );
}

export default exportStrings;
