export const emptyList: unknown[] = [];
export type OptionKey = string | number | boolean;

export interface NoGroupOptions {
    grouped?: false;
}

export interface GroupCommonProps {
    className?: string;
    children: React.ReactNode;
}

export interface BaseProps<D, P, K extends OptionKey> {
    className?: string;
    data: D[] | undefined;
    keySelector(datum: D, index: number): K;
    renderer: (props: P) => JSX.Element;
    rendererClassName?: string;
    rendererParams: (key: K, datum: D, index: number, data: D[]) => P;
    pending: boolean;
    errored: boolean;
    filtered: boolean;
    message?: React.ReactNode;
    emptyMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    filteredMessage?: React.ReactNode;
    compact?: boolean;
    withMessageOverContent?: boolean;
}

export interface GroupOptions<D, GP, GK extends OptionKey> {
    groupComparator?: (a: GK, b: GK) => number;
    groupKeySelector(datum: D): GK;

    groupRenderer: (props: GP) => JSX.Element;
    groupRendererClassName?: string;
    groupRendererParams: (key: GK, index: number, data: D[]) => Omit<GP, 'children' | 'className'>;
    grouped: true;
}
