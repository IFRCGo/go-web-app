import { useMemo } from 'react';
import {
    BooleanOutput,
    type BooleanOutputProps,
    DateOutput,
    type DateOutputProps,
    ListView,
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
import {
    _cs,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

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
    withDiff: boolean;
}

interface BooleanProps extends BooleanOutputProps {
    valueType: 'boolean',
    prevValue?: BooleanOutputProps['value'];
}

interface NumberProps extends NumberOutputProps {
    valueType: 'number',
    prevValue?: NumberOutputProps['value'];
}

interface DateProps extends DateOutputProps {
    valueType: 'date',
    prevValue?: DateProps['value'];
}

interface TextProps {
    valueType: 'text',
    value: string | null | undefined;
    prevValue?: TextProps['value'];
}

interface NodeProps {
    valueType?: never;
    value?: React.ReactNode;
    prevValue?: never;
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
        withDiff,
        ...otherProps
    } = props;

    const valueComponent = useMemo(() => {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            prevValue: _,
            ...componentProps
        } = otherProps;

        if (componentProps.valueType === 'number') {
            return (
                <NumberOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    invalidText={invalidText}
                />
            );
        }

        if (componentProps.valueType === 'date') {
            return (
                <DateOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    invalidText={invalidText}
                    format={DEFAULT_PRINT_DATE_FORMAT}
                />
            );
        }

        if (componentProps.valueType === 'boolean') {
            return (
                <BooleanOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    invalidText={invalidText}
                />
            );
        }

        if (!(componentProps.value instanceof Date)) {
            return componentProps.value || invalidText;
        }

        return invalidText;
    }, [otherProps, invalidText]);

    const prevValueComponent = useMemo(() => {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            value: _,
            ...componentProps
        } = otherProps;

        if (!withDiff) {
            return null;
        }

        if (componentProps.valueType === 'number') {
            return (
                <NumberOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    invalidText={invalidText}
                    value={componentProps.prevValue}
                />
            );
        }

        if (componentProps.valueType === 'date') {
            return (
                <DateOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    invalidText={invalidText}
                    format={DEFAULT_PRINT_DATE_FORMAT}
                    value={componentProps.prevValue}
                />
            );
        }

        if (componentProps.valueType === 'boolean') {
            return (
                <BooleanOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentProps}
                    invalidText={invalidText}
                    value={componentProps.prevValue}
                />
            );
        }

        if (isTruthyString(componentProps.prevValue)) {
            return componentProps.prevValue;
        }

        return invalidText;
    }, [withDiff, otherProps, invalidText]);

    const { value, valueType, prevValue } = otherProps;

    const diffType: 'added' | 'removed' | 'updated' | undefined = useMemo(() => {
        if (!withDiff) {
            return undefined;
        }

        if (isNotDefined(prevValue) && isDefined(value)) {
            return 'added';
        }

        if (isNotDefined(value) && isDefined(prevValue)) {
            return 'removed';
        }

        if (isDefined(valueType) && value !== prevValue) {
            return 'updated';
        }

        return undefined;
    }, [withDiff, value, prevValue, valueType]);

    const spacingOffset = -3;

    const spacingClassName = useSpacingToken({
        spacing,
        offset: spacingOffset,
        modes: withPadding ? fullSpacings : gapSpacings,
    });

    const innerPaddingClassName = useSpacingToken({
        spacing,
        offset: spacingOffset,
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
            {label && (
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
            )}
            {(valueComponent || prevValueComponent) && (
                <div
                    className={_cs(
                        styles.value,
                        strongValue && styles.strong,
                        variant === 'contents' && withPadding && innerPaddingClassName,
                        otherProps.valueType === 'text' && styles.textType,
                    )}
                >
                    {isNotDefined(diffType) && valueComponent}
                    {isDefined(diffType) && (
                        <ListView
                            withWrap
                            spacing={spacing}
                            spacingOffset={spacingOffset}
                            className={_cs(
                                diffType === 'added' && styles.added,
                                diffType === 'updated' && styles.added,
                                diffType === 'removed' && styles.removed,
                            )}
                        >
                            {diffType === 'updated' && (
                                <span className={styles.removed}>{prevValueComponent}</span>
                            )}
                            <span className={styles.added}>
                                {valueComponent}
                            </span>
                        </ListView>
                    )}
                </div>
            )}
        </div>
    );
}

export default PrintableDataDisplay;
