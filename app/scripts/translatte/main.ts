import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { cwd } from 'process';

import lint from './commands/lint';
import listMigrations from './commands/listMigrations';
import mergeMigrations from './commands/mergeMigrations';

import applyMigrations from './commands/applyMigrations';
import generateMigration from './commands/generateMigration';
import exportMigration from './commands/exportMigration';
import { join, basename } from 'path';

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
        'export-migration <MIGRATION_FILE_PATH> <OUTPUT_DIR>',
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
    .strictCommands()
    .showHelpOnFail(false)
    .parse()
