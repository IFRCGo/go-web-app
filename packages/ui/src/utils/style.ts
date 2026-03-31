import { bound } from '@togglecorp/fujs';

export type SpacingType = 'none' | '5xs' | '4xs' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type SpacingMode = 'row-gap' | 'column-gap' | 'padding-inline' | 'padding-block';

export const gapSpacings: SpacingMode[] = ['row-gap', 'column-gap'];
export const paddingSpacings: SpacingMode[] = ['padding-block', 'padding-inline'];
export const fullSpacings: SpacingMode[] = [
    ...gapSpacings,
    ...paddingSpacings,
];

export function getOpticallyCorrectedSpacingValue(value: string, mode: SpacingMode) {
    // Horizontal padding seems a bit imbalanced
    // due to the gap from the line height in vertical padding
    if (mode === 'padding-block' || mode === 'row-gap') {
        return `calc(${value} + (1rem / var(--go-ui-optical-correction-factor) - 1rem))`;
    }

    return value;
}

export function getSpacingValue(
    spacing: SpacingType = 'md',
    offset: number = 0,
) {
    const spacingTokens = [
        '0',
        'var(--go-ui-spacing-5xs)',
        'var(--go-ui-spacing-4xs)',
        'var(--go-ui-spacing-3xs)',
        'var(--go-ui-spacing-2xs)',
        'var(--go-ui-spacing-xs)',
        'var(--go-ui-spacing-sm)',
        'var(--go-ui-spacing-md)',
        'var(--go-ui-spacing-lg)',
        'var(--go-ui-spacing-xl)',
        'var(--go-ui-spacing-2xl)',
        'var(--go-ui-spacing-3xl)',
        'var(--go-ui-spacing-4xl)',
        'var(--go-ui-spacing-5xl)',
    ] as const;

    const spacingTypeToStartIndexMap: Record<SpacingType, number> = {
        none: 0,
        '5xs': 1,
        '4xs': 2,
        '3xs': 3,
        '2xs': 4,
        xs: 5,
        sm: 6,
        md: 7,
        lg: 8,
        xl: 9,
        '2xl': 10,
        '3xl': 11,
        '4xl': 12,
        '5xl': 13,
    };

    const startIndex = bound(
        spacingTypeToStartIndexMap[spacing] + offset,
        0,
        spacingTokens.length - 1,
    );

    const spacingValue = spacingTokens[
        bound(
            startIndex,
            0,
            spacingTokens.length - 1,
        )
    ];

    return spacingValue;
}
