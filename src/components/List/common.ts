export const emptyList: unknown[] = [];
export type OptionKey = string | number | boolean;

export interface NoGroupOptions {
    grouped?: false;
}

export interface GroupCommonProps {
    className?: string;
    children: React.ReactNode;
}

export interface BaseProps<DATUM, RENDERER_PROPS, KEY extends OptionKey> {
    className?: string;
    data: DATUM[] | undefined;
    keySelector(datum: DATUM, index: number): KEY;
    renderer: React.ComponentType<RENDERER_PROPS>;
    rendererClassName?: string;
    rendererParams: (key: KEY, datum: DATUM, index: number, data: DATUM[]) => RENDERER_PROPS;
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
