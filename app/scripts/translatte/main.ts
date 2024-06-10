import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { cwd } from 'process';

import lint from './commands/lint';
import listMigrations from './commands/listMigrations';
import mergeMigrations from './commands/mergeMigrations';

import applyMigrations from './commands/applyMigrations';
import generateMigration from './commands/generateMigration';
import exportMigrations from './commands/exportMigrations';

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
        },
        async (argv) => {
            await lint(currentDir, argv.TRANSLATION_FILE as string[]);
        },
    )
    .command(
        'generate-migration <MIGRATION_DIR> <TRANSLATION_FILE..>',
        'Generate migration file',
        (yargs) => {
            yargs.positional('MIGRATION_DIR', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_DIR',
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
                argv.MIGRATION_DIR as string,
                argv.TRANSLATION_FILE as string,
                new Date().getTime(),
                argv.dryRun as (boolean | undefined),
            );
        },
    )
    .command(
        'list-migrations <MIGRATION_DIR>',
        'List migration files',
        (yargs) => {
            yargs.positional('MIGRATION_DIR', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_DIR',
            });
        },
        async (argv) => {
            await listMigrations(currentDir, argv.MIGRATION_DIR as string);
        },
    )
    .command(
        'merge-migrations <MIGRATION_DIR>',
        'Merge migration files',
        (yargs) => {
            yargs.positional('MIGRATION_DIR', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_DIR',
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
                argv.MIGRATION_DIR as string,
                argv.from as string,
                argv.to as string,
                argv.dryRun as (boolean | undefined),
            );
        },
    )
    .command(
        'export-migrations <MIGRATION_DIR>',
        'Export migrations to excel format which can be used to translate the new and updated strings',
        (yargs) => {
            yargs.positional('MIGRATION_DIR', {
                type: 'string',
                describe: 'Find the migration files on MIGRATION_DIR',
            });
            yargs.options({
                'last-applied-migration': {
                    type: 'string',
                    description: 'The migration file name from which the export is started',
                    demandOption: true,
                },
                'output-dir': {
                    type: 'string',
                    describe: 'Directory where the output xlsx should be saved',
                    demandOption: true,
                }
            });
        },
        async (argv) => {
            const migrationDir = argv.MIGRATION_DIR as string;
            const outputDir = argv.outputDir as string;
            const lastAppliedMigration = argv.lastAppliedMigration as string;

            await exportMigrations(
                migrationDir,
                lastAppliedMigration,
                outputDir,
            );
        },
    )
    .command(
        'apply-migrations <MIGRATION_DIR>',
        'Apply migrations locally and output a json file',
        (yargs) => {
            yargs.positional('MIGRATION_DIR', {
                type: 'string',
                describe: 'Find the migration file on MIGRATION_DIR',
            });
            yargs.options({
                'dry-run': {
                    alias: 'd',
                    description: 'Dry run',
                    type: 'boolean',
                },
                'source': {
                    type: 'array',
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
                argv.source as string[],
                argv.destination as string,
                argv.MIGRATION_DIR as string,
                ['es', 'ar', 'fr'],
                argv.dryRun as (boolean | undefined),
            );
        },
    )
    .strictCommands()
    .parse()
