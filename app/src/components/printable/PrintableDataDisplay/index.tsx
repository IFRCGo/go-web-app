import { useMemo } from 'react';
import {
    BooleanOutput,
    type BooleanOutputProps,
    DateOutput,
    type DateOutputProps,
    NumberOutput,
    type NumberOutputProps,
} from '@ifrc-go/ui';
import { useSpacingToken } from '@ifrc-go/ui/hooks';
import {
    DEFAULT_INVALID_TEXT,
    DEFAULT_PRINT_DATE_FORMAT,
    fullSpacings,
    gapSpacings,
    paddingSpacings,
    type SpacingType,
} from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    label?: React.ReactNode;
    strongValue?: boolean;
    strongLabel?: boolean;
    withoutLabelColon?: boolean;
    invalidText?: React.ReactNode;
    variant?: 'block' | 'inline' | 'contents';
    withPadding?: boolean;
    withBackground?: boolean;
    spacing?: SpacingType;
}

interface BooleanProps extends BooleanOutputProps {
    valueType: 'boolean',
}

interface NumberProps extends NumberOutputProps {
    valueType: 'number',
}

interface DateProps extends DateOutputProps {
    valueType: 'date',
}

interface TextProps {
    valueType: 'text',
    value: string | null | undefined;
}

interface NodeProps {
    valueType?: never;
    value?: React.ReactNode;
}

type Props = BaseProps & (
    NodeProps | TextProps | DateProps | NumberProps | BooleanProps
);

function PrintableDataDisplay(props: Props) {
    const {
        className,
        label,
        strongLabel,
        strongValue,
        withoutLabelColon,
        invalidText = DEFAULT_INVALID_TEXT,
        variant = 'inline',
        withPadding,
        withBackground,
        spacing,
        ...otherProps
    } = props;

    const valueComponent = useMemo(() => {
        if (otherProps.valueType === 'number') {
            return (
                <NumberOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    invalidText={invalidText}
                />
            );
        }

        if (otherProps.valueType === 'date') {
            return (
                <DateOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    invalidText={invalidText}
                    format={DEFAULT_PRINT_DATE_FORMAT}
                />
            );
        }

        if (otherProps.valueType === 'boolean') {
            return (
                <BooleanOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    invalidText={invalidText}
                />
            );
        }

        if (!(otherProps.value instanceof Date)) {
            return otherProps.value || invalidText;
        }

        return invalidText;
    }, [otherProps, invalidText]);

    const spacingClassName = useSpacingToken({
        spacing,
        offset: -3,
        modes: withPadding ? fullSpacings : gapSpacings,
    });

    const innerPaddingClassName = useSpacingToken({
        spacing,
        offset: -3,
        modes: paddingSpacings,
    });

    return (
        <div
            className={_cs(
                styles.printableDataDisplay,
                variant === 'inline' && styles.inlineVariant,
                variant === 'block' && styles.blockVariant,
                variant === 'contents' && styles.contentsVariant,
                withBackground && styles.withBackground,
                spacingClassName,
                className,
            )}
        >
            <div
                className={_cs(
                    styles.label,
                    strongLabel && styles.strong,
                    variant === 'contents' && withPadding && innerPaddingClassName,
                    !withoutLabelColon && styles.withColon,
                )}
            >
                {label}
            </div>
            <div
                className={_cs(
                    styles.value,
                    strongValue && styles.strong,
                    variant === 'contents' && withPadding && innerPaddingClassName,
                    otherProps.valueType === 'text' && styles.textType,
                )}
            >
                {valueComponent}
            </div>
        </div>
    );
}

export default PrintableDataDisplay;
