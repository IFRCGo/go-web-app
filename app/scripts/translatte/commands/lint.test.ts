import { expect } from 'vitest';
import { join } from 'path';
import { mkdirSync } from 'fs';

import { loginContent, registerContent } from '../mockData';
import { testWithTmpDir } from '../testHelpers';
import { writeFilePromisify } from '../utils';
import lint from './lint';

testWithTmpDir('test lint with duplicate file', async ({ tmpdir }) => {
    mkdirSync(join(tmpdir, 'i18n'));

    const writes = [
        { name: 'login.i18n.json', content: loginContent },
        { name: 'register.i18n.json', content: registerContent },
        { name: 'register-form.i18n.json', content: registerContent },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'i18n', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await expect(
        () => lint(tmpdir, ['**/*.i18n.json'], false)
    ).rejects.toThrow('Found 12 duplicated strings.');
});

testWithTmpDir('test lint with duplicate string and same text', async ({ tmpdir }) => {
    mkdirSync(join(tmpdir, 'i18n'));

    const writes = [
        { name: 'login.i18n.json', content: loginContent },
        { name: 'register.i18n.json', content: registerContent },
        { name: 'register-form.i18n.json', content: {
            namespace: 'register',
            strings: {
                firstNameLabel: 'First Name',
            },
        } },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'i18n', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await expect(
        () => lint(tmpdir, ['**/*.i18n.json'], false)
    ).rejects.toThrow('Found 2 duplicated strings.');
});

testWithTmpDir('test lint with duplicate string and different text', async ({ tmpdir }) => {
    mkdirSync(join(tmpdir, 'i18n'));

    const writes = [
        { name: 'login.i18n.json', content: loginContent },
        { name: 'register.i18n.json', content: registerContent },
        { name: 'register-form.i18n.json', content: {
            namespace: 'register',
            strings: {
                firstNameLabel: 'First Name*',
            },
        } },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, 'i18n', name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await expect(
        () => lint(tmpdir, ['**/*.i18n.json'], false)
    ).rejects.toThrow('Found 2 duplicated strings.');
});
