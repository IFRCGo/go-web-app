import {
    useEffect,
    useState,
} from 'react';
import {
    bound,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';

import {
    type SpacingType,
    type SpacingVariant,
} from '#components/types';

interface Props {
    spacing: SpacingType;
    variant?: SpacingVariant;
    mode?: 'gap' | 'padding-h' | 'padding-v' | 'grid-gap';
    inner?: boolean;
}

function useSpacingTokens(props: Props) {
    const [className] = useState(() => `_${randomString()}`);

    const {
        spacing,
        variant = 'md',
        mode = 'gap',
        inner,
    } = props;

    useEffect(
        () => {
            const spacingTokens = [
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
            ] as const;

            let spacingValue = '0';

            if (spacing !== 'none') {
                const spacingTypeToOffsetMap: Record<Exclude<SpacingType, 'none'>, number> = {
                    condensed: -3,
                    compact: -2,
                    cozy: -1,
                    default: 0,
                    comfortable: 1,
                    relaxed: 2,
                    loose: 3,
                };

                const spacingVariantToTokenStartIndex: Record<SpacingVariant, number> = {
                    xs: 3,
                    sm: 4,
                    md: 5,
                    lg: 6,
                    xl: 7,
                };

                const startIndex = inner
                    ? (spacingVariantToTokenStartIndex[variant] - 1)
                    : spacingVariantToTokenStartIndex[variant];
                const offset = spacingTypeToOffsetMap[spacing];

                spacingValue = spacingTokens[
                    bound(
                        startIndex + offset,
                        0,
                        spacingTokens.length - 1,
                    )
                ];
            }

            if (isNotDefined(spacing)) {
                return undefined;
            }

            const style = document.createElement('style');
            document.head.appendChild(style);
            if (!style.sheet) {
                style.remove();
                return undefined;
            }

            let rules;

            if (mode === 'gap' || mode === 'grid-gap') {
                rules = `gap: ${spacingValue};`;
            } else if (mode === 'padding-h') {
                rules = `padding-left: ${spacingValue}; padding-right: ${spacingValue};`;
            } else if (mode === 'padding-v') {
                rules = `padding-top: ${spacingValue}; padding-bottom: ${spacingValue};`;
            }

            style.sheet.insertRule(`.${className} { ${rules} }`);

            return () => {
                style.remove();
            };
        },
        [spacing, variant, mode, inner, className],
    );

    return className;
}

export default useSpacingTokens;
