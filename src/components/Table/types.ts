export type SortDirection = 'asc' | 'dsc';

export interface BaseHeader {
    className?: string;
    titleClassName?: string;
    name: string;
    index: number;

    title?: string;
}

export interface BaseCell {
    className?: string;
    name: string;
}
