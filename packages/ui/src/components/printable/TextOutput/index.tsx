import { _cs } from '@togglecorp/fujs';

import RawOutput, { Props as RawOutputProps } from '#components/RawOutput';
import {
    DEFAULT_INVALID_TEXT,
    DEFAULT_PRINT_DATE_FORMAT,
} from '#utils/constants';
import {
    BackgroundColorType,
    getBackgroundColorClassName,
} from '#utils/style';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    label?: React.ReactNode;
    labelClassName?: string;
    valueClassName?: string;
    strongValue?: boolean;
    strongLabel?: boolean;
    /** Suppresses the ':' appended after the label by default */
    withoutLabelColon?: boolean;
    /** Layout variant: inline row, stacked block or display-contents cells */
    styleVariant?: 'block' | 'default' | 'contents';
    withPadding?: boolean;
    /** Surface color token (the old withBackground boolean meant 'background') */
    backgroundColor?: BackgroundColorType;
}

export type Props = BaseProps & RawOutputProps;

/**
 * Labelled value row for print layouts (specific, printable layer).
 *
 * Print counterpart of TextOutput: value rendering is delegated to
 * RawOutput, so the `valueType` discriminated union and per-type props
 * come from RawOutputProps. Dates are always formatted with the print
 * date format.
 */
function TextOutput(props: Props) {
    const {
        className,
        label,
        labelClassName,
        valueClassName,
        strongLabel,
        strongValue,
        withoutLabelColon,
        invalidText = DEFAULT_INVALID_TEXT,
        styleVariant = 'default',
        withPadding,
        backgroundColor,
        ...rawOutputProps
    } = props;

    let valueComponent: React.ReactNode;
    if (rawOutputProps.valueType === 'date') {
        valueComponent = (
            <RawOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rawOutputProps}
                invalidText={invalidText}
                format={DEFAULT_PRINT_DATE_FORMAT}
            />
        );
    } else {
        valueComponent = (
            <RawOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rawOutputProps}
                invalidText={invalidText}
            />
        );
    }

    return (
        <div
            className={_cs(
                styles.textOutput,
                styleVariant === 'default' && styles.defaultVariant,
                styleVariant === 'contents' && styles.contentsVariant,
                styleVariant === 'block' && styles.blockVariant,
                withPadding && styles.withPadding,
                getBackgroundColorClassName(backgroundColor),
                className,
            )}
        >
            <div
                className={_cs(
                    styles.label,
                    strongLabel && styles.strong,
                    labelClassName,
                    !withoutLabelColon && styles.withColon,
                )}
            >
                {label}
            </div>
            <div
                className={_cs(
                    styles.value,
                    strongValue && styles.strong,
                    rawOutputProps.valueType === 'text' && styles.textType,
                    valueClassName,
                )}
            >
                {valueComponent}
            </div>
        </div>
    );
}

export default TextOutput;
