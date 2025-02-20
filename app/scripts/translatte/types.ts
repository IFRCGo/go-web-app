interface MigrationAddActionItem {
    action: 'add',
    key: string,
    value: string,
    namespace: string,
}

interface MigrationRemoveActionItem {
    action: 'remove',
    key: string,
    namespace: string,
}

interface MigrationUpdateActionItem {
    action: 'update',
    key: string,
    namespace: string,
    value?: string,
    newValue?: string,
    newKey?: string,
    newNamespace?: string,
}

export type MigrationActionItem = MigrationAddActionItem | MigrationRemoveActionItem | MigrationUpdateActionItem;

export interface TranslationFileContent {
    namespace: string,
    strings: {
        [key: string]: string,
    },
}

export interface MigrationFileContent {
    parent?: string;
    actions: MigrationActionItem[],
}

export interface SourceStringItem {
    hash: string;
    // id: string;
    key: string;
    language: string;
    page_name: string;
    value: string;
}

export interface SourceFileContent {
    last_migration?: string;
    strings: SourceStringItem[];
}
