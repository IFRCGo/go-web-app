import { expect } from 'vitest';
import { mkdirSync } from 'fs';
import { join } from 'path';

import generateMigration from './generateMigration';
import { testWithTmpDir } from '../testHelpers';
import { writeFilePromisify, readMigrations } from '../utils';
import {
    migrationContent1,
    migrationContent2,
    migrationContent3,
    migrationContent4,
    migrationContent5,
    loginContent,
    registerContent,
    updatedLoginContent,
    updatedRegisterContent,
    migrationContent6,
} from '../mockData';


testWithTmpDir('test generateMigration with no change', async ({ tmpdir }) => {
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

    mkdirSync(join(tmpdir, 'src'));
    const translations = [
        { name: 'home.i18n.json', content: loginContent },
        { name: 'register.i18n.json', content: registerContent },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'src', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(translations);

    await expect(
        () => generateMigration(
            tmpdir,
            'migrations',
            'src/**/*.i18n.json',
            new Date().getTime(),
            false,
        ),
    ).rejects.toThrow('Nothing to do');
});

testWithTmpDir('test generateMigration with change', async ({ tmpdir }) => {
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

    mkdirSync(join(tmpdir, 'src'));

    const translations = [
        { name: 'home.i18n.json', content: updatedLoginContent },
        { name: 'register.i18n.json', content: updatedRegisterContent },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'src', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(translations);

    const timestamp = new Date().getTime();

    await generateMigration(
        tmpdir,
        'migrations',
        'src/**/*.i18n.json',
        timestamp,
        false,
    );

    const generatedMigrations = await readMigrations([
        join(tmpdir, 'migrations', `000006-${timestamp}.json`)
    ]);
    const generatedMigrationContent = generatedMigrations[0].content;

    expect(generatedMigrationContent).toEqual(migrationContent6)
});
