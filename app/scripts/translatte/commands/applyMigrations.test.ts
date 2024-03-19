import { expect } from 'vitest';
import { mkdirSync } from 'fs';
import { join } from 'path';

import { testWithTmpDir } from '../testHelpers';
import {
    writeFilePromisify,
    readJsonFilesContents,
} from '../utils';
import {
    migrationContent1,
    migrationContent2,
    migrationContent3,
    migrationContent4,
    migrationContent5,
    migrationContent6,

    strings1,
    strings2,
} from '../mockData';
import applyMigrations from './applyMigrations';
import { SourceFileContent } from '../types';

testWithTmpDir('test applyMigrations with no data in server', async ({ tmpdir }) => {
    mkdirSync(join(tmpdir, 'migrations'));
    const migrations = [
        { name: '000001-1000000000000.json', content: migrationContent1 },
        { name: '000002-1000000000000.json', content: migrationContent2 },
        { name: '000003-1000000000000.json', content: migrationContent3 },
        { name: '000004-1000000000000.json', content: migrationContent4 },
        { name: '000005-1000000000000.json', content: migrationContent5 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'migrations', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(migrations);

    mkdirSync(join(tmpdir, 'strings'));

    const emptySourceFile: SourceFileContent = {
        last_migration: undefined,
        strings: [],
    };
    await writeFilePromisify(
        join(tmpdir, 'strings', 'before.json'),
        JSON.stringify(emptySourceFile),
        'utf8',
    );

    await applyMigrations(
        tmpdir,
        join(tmpdir, 'strings', 'before.json'),
        join(tmpdir, 'strings', 'after.json'),
        'migrations',
        ['np'],
        undefined,
        false,
    );

    const newSourceFiles = await readJsonFilesContents([
        join(tmpdir, 'strings', 'after.json'),
    ]);
    const newSourceFileContent = newSourceFiles[0].content;

    expect(newSourceFileContent).toEqual(strings1)
});

testWithTmpDir('test applyMigrations with data in server', async ({ tmpdir }) => {
    mkdirSync(join(tmpdir, 'migrations'));
    const migrations = [
        { name: '000006-1000000000000.json', content: migrationContent6 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'migrations', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(migrations);

    mkdirSync(join(tmpdir, 'strings'));

    await writeFilePromisify(
        join(tmpdir, 'strings', 'before.json'),
        JSON.stringify(strings1),
        'utf8',
    );

    await applyMigrations(
        tmpdir,
        join(tmpdir, 'strings', 'before.json'),
        join(tmpdir, 'strings', 'after.json'),
        'migrations',
        ['np'],
        undefined,
        false,
    );

    const newSourceFiles = await readJsonFilesContents([
        join(tmpdir, 'strings', 'after.json'),
    ]);
    const newSourceFileContent = newSourceFiles[0].content;

    expect(newSourceFileContent).toEqual(strings2)
});
