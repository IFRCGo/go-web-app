import { test } from "vitest";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

interface TmpDirFixture {
    tmpdir: string;
}

async function createTempDir() {
    const ostmpdir = os.tmpdir();
    const tmpdir = path.join(ostmpdir, "unit-test-");
    return await fs.mkdtemp(tmpdir);
}

export const testWithTmpDir = test.extend<TmpDirFixture>({
    tmpdir: async ({}, use) => {
        const directory = await createTempDir();

        await use(directory);

        await fs.rm(directory, { recursive: true });
    },
});
