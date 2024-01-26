import { expect } from 'vitest';
import { join } from 'path';
import { mkdirSync } from 'fs';

import { testWithTmpDir } from '../testHelpers';
import { writeFilePromisify, getMigrationFilesAttrs } from '../utils';
import {
    migrationContent1,
    migrationContent2,
    migrationContent3,
    migrationContent4,
    migrationContent5,
} from '../mockData';

testWithTmpDir('test listMigrations', async ({ tmpdir }) => {
    mkdirSync(join(tmpdir, 'migrations'));

    const writes = [
        { name: '001-1000000000000.json', content: migrationContent1 },
        { name: '002-1000000000000.json', content: migrationContent2 },
        { name: '003-1000000000000.json', content: migrationContent3 },
        { name: '004-1000000000000.json', content: migrationContent4 },
        { name: '005-1000000000000.json', content: migrationContent5 },

        { name: 'xyz-1000000000000.json', content: migrationContent5 },
        { name: '006-abcdefghijklm.json', content: migrationContent5 },
        { name: '005-1000000000000', content: migrationContent5 },
        { name: 'migration-6.json', content: migrationContent5 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'migrations', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    expect(
        (await getMigrationFilesAttrs(
            tmpdir,
            'migrations',
        )).map((item) => ({ ...item, fileName: undefined })),
    ).toEqual([
        { migrationName: '001-1000000000000.json', num: '001', timestamp: '1000000000000' },
        { migrationName: '002-1000000000000.json', num: '002', timestamp: '1000000000000' },
        { migrationName: '003-1000000000000.json', num: '003', timestamp: '1000000000000' },
        { migrationName: '004-1000000000000.json', num: '004', timestamp: '1000000000000' },
        { migrationName: '005-1000000000000.json', num: '005', timestamp: '1000000000000' },
    ]);
});
