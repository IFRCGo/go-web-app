import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { cwd } from 'process';
import { join, basename } from 'path';

import lint from './commands/lint';
import listMigrations from './commands/listMigrations';
import mergeMigrations from './commands/mergeMigrations';

import applyMigrations from './commands/applyMigrations';
import generateMigration from './commands/generateMigration';
import exportMigration from './commands/exportMigration';
import pushStringsFromExcel from './commands/pushStringsFromExcel';
import exportServerStringsToExcel from './commands/exportServerStringsToExcel';
import exportStringsForMock from './commands/exportStringsForMock';
import clearServerStrings from './commands/clearServerStrings';
import pushMigrationsToIfrc from './commands/pushMigrationsToIfrc';
import pushStringsFromExcelToIfrc from './commands/pushStringsFromExcelToIfrc';
import lintMigrations from './commands/lintMigrations';
import pushMigrationsToGo from './commands/pushMigrationsToGo';

const currentDir = cwd();

// CLI

yargs(hideBin(process.argv))
    .scriptName('translatte')
    .usage('$0 <cmd> [args]')
    .demandCommand(1)
    .command(
        'lint <TRANSLATION_FILE..>',
        'Lint i18n.json files for duplicated strings',
        (yargs) => {
            yargs.positional('TRANSLATION_FILE', {
                type: 'string',
                describe: 'Read the files from TRANSLATION_FILE',
            });
            yargs.options({
                'fix': {
                    type: 'boolean',
                    description: 'Fix fixable issues',
                },
            });
        },
        async (argv) => {
            await lint(currentDir, argv.TRANSLATION_FILE as string[], argv.fix as boolean | undefined);
        },
    )
    .command(
        'lint-migrations <MIGRATION_DIR_PATH>',
        'Lint migration files for diverging migrations',
        (yargs) => {
            yargs.positional('MIGRATION_DIR_PATH', {
                type: 'string',
                describe: 'Read the files from TRANSLATION_FILE',
            });
        },
        async (argv) => {
            await lintMigrations(
                currentDir,
                argv.MIGRATION_DIR_PATH as string,
            );
        },
    )
    .command(
        'list-migrations <MIGRATION_FILE_PATH>',
        'List migration files',
        (yargs) => {
            yargs.positional('MIGRATION_FILE_PATH', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_FILE_PATH',
            });
        },
        async (argv) => {
            await listMigrations(currentDir, argv.MIGRATION_FILE_PATH as string);
        },
    )
    .command(
        'merge-migrations <MIGRATION_FILE_PATH>',
        'Merge migration files',
        (yargs) => {
            yargs.positional('MIGRATION_FILE_PATH', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_FILE_PATH',
            });
            yargs.options({
                'from': {
                    type: 'string',
                    description: 'The first file that will be included in the merge',
                    demandOption: true,
                },
                'to': {
                    type: 'string',
                    description: 'The to file that will be included in the merge',
                    demandOption: true,
                },
                'dry-run': {
                    alias: 'd',
                    description: 'Dry run',
                    type: 'boolean',
                },
            });
        },
        async (argv) => {
            await mergeMigrations(
                currentDir,
                argv.MIGRATION_FILE_PATH as string,
                argv.from as string,
                argv.to as string,
                argv.dryRun as (boolean | undefined),
            );
        },
    )
    .command(
        'apply-migrations <MIGRATION_FILE_PATH>',
        'Apply migrations',
        (yargs) => {
            yargs.positional('MIGRATION_FILE_PATH', {
                type: 'string',
                describe: 'Find the migration file on MIGRATION_FILE_PATH',
            });
            yargs.options({
                'dry-run': {
                    alias: 'd',
                    description: 'Dry run',
                    type: 'boolean',
                },
                'last-migration': {
                    type: 'string',
                    description: 'The file after which the migration will be applied',
                },
                'source': {
                    type: 'string',
                    description: 'The source file to which migration is applied',
                    demandOption: true,
                },
                'destination': {
                    type: 'string',
                    description: 'The file where new source file is saved',
                    demandOption: true,
                },
            });
        },
        async (argv) => {
            await applyMigrations(
                currentDir,
                argv.SOURCE_FILE as string,
                argv.DESTINATION_FILE as string,
                argv.MIGRATION_FILE_PATH as string,
                ['es', 'ar', 'fr'],
                argv.lastMigration as (string | undefined),
                argv.dryRun as (boolean | undefined),
            );
        },
    )
    .command(
        'generate-migration <MIGRATION_FILE_PATH> <TRANSLATION_FILE..>',
        'Generate migration file',
        (yargs) => {
            yargs.positional('MIGRATION_FILE_PATH', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_FILE_PATH',
            });
            yargs.positional('TRANSLATION_FILE', {
                type: 'string',
                describe: 'Read the files from TRANSLATION_FILE',
            });
            yargs.options({
                'dry-run': {
                    alias: 'd',
                    description: 'Dry run',
                    type: 'boolean',
                },
            });
        },
        async (argv) => {
            await generateMigration(
                currentDir,
                argv.MIGRATION_FILE_PATH as string,
                argv.TRANSLATION_FILE as string,
                new Date().getTime(),
                argv.dryRun as (boolean | undefined),
            );
        },
    )
    .command(
        'export-migration-to-excel <MIGRATION_FILE_PATH> <OUTPUT_DIR>',
        'Export migration file to excel format which can be used to translate the new and updated strings',
        (yargs) => {
            yargs.positional('MIGRATION_FILE_PATH', {
                type: 'string',
                describe: 'Find the migration file on MIGRATION_FILE_PATH',
            });
            yargs.positional('OUTPUT_DIR', {
                type: 'string',
                describe: 'Directory where the output xlsx should be saved',
            });
        },
        async (argv) => {
            const migrationFilePath = (argv.MIGRATION_FILE_PATH as string);

            const outputDir = argv.OUTPUT_DIR as string;

            // Get only the filename without extension
            const exportFileName = basename(migrationFilePath, '.json');

            const exportFilePath = join(outputDir, exportFileName);

            await exportMigration(
                argv.MIGRATION_FILE_PATH as string,
                exportFilePath,
            );
        },
    )
    .command(
        'push-strings-from-excel <IMPORT_FILE_PATH>',
        'Import migration from excel file and push it to server',
        (yargs) => {
            yargs.positional('IMPORT_FILE_PATH', {
                type: 'string',
                describe: 'Find the import file on IMPORT_FILE_PATH',
            });
            yargs.options({
                'auth-token': {
                    type: 'string',
                    describe: 'Authentication token to access the API server',
                    require: true,
                },
                'api-url': {
                    type: 'string',
                    describe: 'URL for the API server',
                    require: true,
                }
            });
        },
        async (argv) => {
            const importFilePath = (argv.IMPORT_FILE_PATH as string);

            await pushStringsFromExcel(
                importFilePath,
                argv.apiUrl as string,
                argv.authToken as string,
            );
        },
    )
    .command(
        'push-strings-from-excel-to-ifrc <IMPORT_FILE_PATH>',
        'Import migration from excel file and push it to server',
        (yargs) => {
            yargs.positional('IMPORT_FILE_PATH', {
                type: 'string',
                describe: 'Find the import file on IMPORT_FILE_PATH',
            });
            yargs.options({
                'api-key': {
                    type: 'string',
                    describe: 'API key to access the API server',
                    require: true,
                },
                'api-url': {
                    type: 'string',
                    describe: 'URL for the API server',
                    require: true,
                },
                'application-id': {
                    type: 'string',
                    describe: 'Application ID in the translation service',
                    require: true,
                }
            });
        },
        async (argv) => {
            const importFilePath = (argv.IMPORT_FILE_PATH as string);

            await pushStringsFromExcelToIfrc(
                importFilePath,
                argv.apiUrl as string,
                argv.apiKey as string,
                argv.applicationId as string,
            );
        },
    )
    .command(
        'push-migrations-to-go <MIGRATION_DIR_PATH>',
        'Push migrations to GO API',
        (yargs) => {
            yargs.positional('MIGRATION_DIR_PATH', {
                type: 'string',
                describe: 'Find the import file on MIGRATION_DIR_PATH',
            });
            yargs.options({
                'auth-token': {
                    type: 'string',
                    describe: 'Authentication token to access the API server',
                    require: true,
                },
                'api-url': {
                    type: 'string',
                    describe: 'URL for the API server',
                    require: true,
                }
            });
        },
        async (argv) => {
            const migrationDirPath = (argv.MIGRATION_DIR_PATH as string);

            await pushMigrationsToGo(
                currentDir,
                migrationDirPath,
                argv.apiUrl as string,
                argv.authToken as string,
            );
        },
    )
    .command(
        'push-migrations-to-ifrc <MIGRATION_DIR_PATH>',
        'Push migrations to IFRC translations service',
        (yargs) => {
            yargs.positional('MIGRATION_DIR_PATH', {
                type: 'string',
                describe: 'Find the import file on MIGRATION_DIR_PATH',
            });
            yargs.options({
                'api-key': {
                    type: 'string',
                    describe: 'Authentication token to access the API server',
                    require: true,
                },
                'api-url': {
                    type: 'string',
                    describe: 'URL for the API server',
                    require: true,
                },
                'application-id': {
                    type: 'string',
                    describe: 'Application ID in the translation service',
                    require: true,
                }
            });
        },
        async (argv) => {
            const migrationDirPath = (argv.MIGRATION_DIR_PATH as string);

            await pushMigrationsToIfrc(
                currentDir,
                migrationDirPath,
                argv.apiUrl as string,
                argv.apiKey as string,
                argv.applicationId as string,
            );
        },
    )
    .command(
        'export-server-strings <API_URL>',
        'Export server strings to excel file',
        (yargs) => {
            yargs.positional('API_URL', {
                type: 'string',
                describe: 'Fetch server strings from API_URL, language is auto appended (e.g. API_URL/en)',
            });
            yargs.options({
                'auth-token': {
                    type: 'string',
                    describe: 'Authentication token to access the API server',
                    require: false,
                },
                'output-file-name': {
                    type: 'string',
                    describe: 'Output excel file name',
                    require: false,
                },
            });
        },
        async (argv) => {
            await exportServerStringsToExcel(
                argv.API_URL as string,
                argv.authToken as string | undefined,
                argv.outputFileName as string | undefined
            );
        },
    )
    .command(
        'export-strings-for-mock <TRANSLATION_FILE..>',
        'Export local i18n strings to an excel file in the IFRC translation service export format, filling translations from the service (mock source for the translation cache server)',
        (yargs) => {
            yargs.positional('TRANSLATION_FILE', {
                type: 'string',
                describe: 'Read the files from TRANSLATION_FILE',
            });
            yargs.options({
                'api-url': {
                    type: 'string',
                    describe: 'URL for the IFRC translation service API',
                    require: true,
                },
                'api-key': {
                    type: 'string',
                    describe: 'API key to access the IFRC translation service',
                    require: true,
                },
                'application-id': {
                    type: 'string',
                    describe: 'Application ID in the translation service',
                    require: true,
                },
                'output-file-name': {
                    type: 'string',
                    describe: 'Output excel file name (default: translations)',
                    require: false,
                },
            });
        },
        async (argv) => {
            await exportStringsForMock(
                currentDir,
                argv.TRANSLATION_FILE as string[],
                argv.apiUrl as string,
                argv.apiKey as string,
                argv.applicationId as string,
                argv.outputFileName as string | undefined,
            );
        },
    )
    .command(
        'clear-server-strings',
        'Clear all existing strings in the server',
        (yargs) => {
            yargs.options({
                'auth-token': {
                    type: 'string',
                    describe: 'Authentication token to access the API server',
                    require: true,
                },
                'api-url': {
                    type: 'string',
                    describe: 'URL for the API server',
                    require: true,
                }
            });
        },
        async (argv) => {
            await clearServerStrings(
                argv.apiUrl as string,
                argv.authToken as string,
            );
        },
    )
    .strictCommands()
    .showHelpOnFail(false)
    .parse()
