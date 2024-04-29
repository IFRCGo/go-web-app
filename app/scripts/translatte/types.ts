export interface MigrationAddActionItem {
    action: 'add',
    key: string,
    value: string,
    namespace: string,
}

export interface MigrationRemoveActionItem {
    action: 'remove',
    key: string,
    namespace: string,
}

export interface MigrationUpdateActionItem {
    action: 'update',
    key: string,
    namespace: string,
    value?: string,
    newValue?: string,
    newKey?: string,
    newNamespace?: string,
}

export type ServerActionItem  = {
    action: 'set',
    key: string,
    page_name: string,
    value: string,
    hash: string,
} | {
    action: 'delete'
    key: string;
    page_name: string;
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

export type Language = 'en' | 'fr' | 'es' | 'ar'
