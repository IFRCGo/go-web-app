import { expect, test } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

import mergeMigrations, { merge } from './mergeMigrations';
import { testWithTmpDir } from '../testHelpers';
import { writeFilePromisify, readMigrations } from '../utils';
import {
    migrationContent1,
    migrationContent2,
    migrationContent3,
    migrationContent4,
    migrationContent5,
} from '../mockData';

test('Test merge migrations 1-5', () => {
    expect(merge([
        migrationContent1,
        migrationContent2,
        migrationContent3,
        migrationContent4,
        migrationContent5,
    ])).toEqual([
        {
            "action": "add",
            "namespace": "login",
            "key": "emailLabel",
            "value": "Email/Username"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "emailPlaceholder",
            "value": "Email/Username*"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "passwordLabel",
            "value": "Password"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "loginButton",
            "value": "Login"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "firstNameLabel",
            "value": "First Name"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "lastNameLabel",
            "value": "Last Name"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "emailLabel",
            "value": "Email"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "passwordLabel",
            "value": "Password"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "confirmPasswordLabel",
            "value": "Confirm Password"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "header",
            "value": "If you are staff, member or volunteer of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) login with you email and password."
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "registerButton",
            "value": "Register"
        },
    ]);
});

test('Test merge migrations 2-5', () => {
    expect(merge([
        migrationContent2,
        migrationContent3,
        migrationContent4,
        migrationContent5,
    ])).toEqual([
        {
            "action": "update",
            "namespace": "login",
            "key": "emailLabel",
            "newValue": "Email/Username"
        },
        {
            "action": "update",
            "namespace": "login",
            "key": "passwordLabel",
            "newValue": "Password"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "firstNameLabel",
            "newValue": "First Name"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "lastNameLabel",
            "newValue": "Last Name"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "emailLabel",
            "newValue": "Email"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "passwordLabel",
            "newValue": "Password"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "confirmPasswordLabel",
            "newValue": "Confirm Password"
        },
        {
            "action": "update",
            "key": "signUpButton",
            "namespace": "register",
            "newKey": "registerButton",
            "newNamespace": undefined,
            "newValue": "Register",
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "header",
            "value": "If you are staff, member or volunteer of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) login with you email and password."
        },
        {
            "action": "remove",
            "namespace": "home",
            "key": "header"
        },
        {
            "action": "remove",
            "namespace": "home",
            "key": "subHeader"
        },
    ]);
});

test('Test merge migrations 3-5', () => {
    expect(merge([
        migrationContent3,
        migrationContent4,
        migrationContent5,
    ])).toEqual([
        {
            "action": "add",
            "namespace": "login",
            "key": "header",
            "value": "If you are staff, member or volunteer of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) login with you email and password."
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "signUpButton",
            "newKey": "registerButton"
        },
        {
            "action": "remove",
            "namespace": "home",
            "key": "header"
        },
        {
            "action": "remove",
            "namespace": "home",
            "key": "subHeader"
        },
    ]);
});

test('Test merge migrations 4-5', () => {
    expect(merge([
        migrationContent4,
        migrationContent5,
    ])).toEqual([
            {
                "action": "remove",
                "namespace": "login",
                "key": "header"
            },
            {
                "action": "update",
                "namespace": "register",
                "key": "header",
                "newNamespace": "login"
            },
            {
                "action": "update",
                "namespace": "register",
                "key": "signUpButton",
                "newKey": "registerButton"
            },
            {
                "action": "remove",
                "namespace": "home",
                "key": "header"
            },
            {
                "action": "remove",
                "namespace": "home",
                "key": "subHeader"
            },
    ]);
});

test('Test merge migrations 5-5', () => {
    expect(merge([
        migrationContent5,
    ])).toEqual(migrationContent5.actions)
})

testWithTmpDir('test mergeMigrations 1-5', async ({ tmpdir }) => {
    const writes = [
        { name: '000001-1000000000000.json', content: migrationContent1 },
        { name: '000002-1000000000000.json', content: migrationContent2 },
        { name: '000003-1000000000000.json', content: migrationContent3 },
        { name: '000004-1000000000000.json', content: migrationContent4 },
        { name: '000005-1000000000000.json', content: migrationContent5 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await mergeMigrations(
        tmpdir,
        '.',
        '000001-1000000000000.json',
        '000005-1000000000000.json',
        false,
    );

    expect(existsSync(join(tmpdir, '000001-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000002-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000003-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000004-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000005-1000000000000.json'))).toBeTruthy();

    const generatedFiles = await readMigrations([join(tmpdir, '000005-1000000000000.json')]);
    const generatedFile = generatedFiles[0];
    expect(generatedFile.content.parent).toBe(undefined);
});

testWithTmpDir('test mergeMigrations 2-5', async ({ tmpdir }) => {
    const writes = [
        { name: '000001-1000000000000.json', content: migrationContent1 },
        { name: '000002-1000000000000.json', content: migrationContent2 },
        { name: '000003-1000000000000.json', content: migrationContent3 },
        { name: '000004-1000000000000.json', content: migrationContent4 },
        { name: '000005-1000000000000.json', content: migrationContent5 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await mergeMigrations(
        tmpdir,
        '.',
        '000002-1000000000000.json',
        '000005-1000000000000.json',
        false,
    );

    expect(existsSync(join(tmpdir, '000001-1000000000000.json'))).toBeTruthy();
    expect(existsSync(join(tmpdir, '000002-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000003-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000004-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000005-1000000000000.json'))).toBeTruthy();

    const generatedFiles = await readMigrations([join(tmpdir, '000005-1000000000000.json')]);
    const generatedFile = generatedFiles[0];
    expect(generatedFile.content.parent).toBe('000001-1000000000000');
});

testWithTmpDir('test mergeMigrations 3-5', async ({ tmpdir }) => {
    const writes = [
        { name: '000001-1000000000000.json', content: migrationContent1 },
        { name: '000002-1000000000000.json', content: migrationContent2 },
        { name: '000003-1000000000000.json', content: migrationContent3 },
        { name: '000004-1000000000000.json', content: migrationContent4 },
        { name: '000005-1000000000000.json', content: migrationContent5 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await mergeMigrations(
        tmpdir,
        '.',
        '000003-1000000000000.json',
        '000005-1000000000000.json',
        false,
    );

    expect(existsSync(join(tmpdir, '000001-1000000000000.json'))).toBeTruthy();
    expect(existsSync(join(tmpdir, '000002-1000000000000.json'))).toBeTruthy();
    expect(existsSync(join(tmpdir, '000003-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000004-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000005-1000000000000.json'))).toBeTruthy();

    const generatedFiles = await readMigrations([join(tmpdir, '000005-1000000000000.json')]);
    const generatedFile = generatedFiles[0];
    expect(generatedFile.content.parent).toBe('000002-1000000000000');
});

testWithTmpDir('test mergeMigrations 4-5', async ({ tmpdir }) => {
    const writes = [
        { name: '000001-1000000000000.json', content: migrationContent1 },
        { name: '000002-1000000000000.json', content: migrationContent2 },
        { name: '000003-1000000000000.json', content: migrationContent3 },
        { name: '000004-1000000000000.json', content: migrationContent4 },
        { name: '000005-1000000000000.json', content: migrationContent5 },
    ].map(({ name, content }) => writeFilePromisify(
        join(tmpdir, name),
        JSON.stringify(content, null, 4),
        'utf8',
    ));
    await Promise.all(writes);

    await mergeMigrations(
        tmpdir,
        '.',
        '000004-1000000000000.json',
        '000005-1000000000000.json',
        false,
    );

    expect(existsSync(join(tmpdir, '000001-1000000000000.json'))).toBeTruthy();
    expect(existsSync(join(tmpdir, '000002-1000000000000.json'))).toBeTruthy();
    expect(existsSync(join(tmpdir, '000003-1000000000000.json'))).toBeTruthy();
    expect(existsSync(join(tmpdir, '000004-1000000000000.json'))).toBeFalsy();
    expect(existsSync(join(tmpdir, '000005-1000000000000.json'))).toBeTruthy();

    const generatedFiles = await readMigrations([join(tmpdir, '000005-1000000000000.json')]);
    const generatedFile = generatedFiles[0];
    expect(generatedFile.content.parent).toBe('000003-1000000000000');
});
