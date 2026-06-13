import BooleanDisplay, { Props as BooleanDisplayProps } from '#components/BooleanDisplay';
import DateDisplay, { Props as DateDisplayProps } from '#components/DateDisplay';
import NumberDisplay, { Props as NumberDisplayProps } from '#components/NumberDisplay';

export interface BooleanValueProps extends BooleanDisplayProps {
    valueType: 'boolean';
}

export interface NumberValueProps extends NumberDisplayProps {
    valueType: 'number';
}

export interface DateValueProps extends DateDisplayProps {
    valueType: 'date';
}

export interface TextValueProps {
    valueType: 'text';
    value: string | null | undefined;
    /** Rendered when value is absent or empty */
    invalidText?: React.ReactNode;
}

export interface NodeValueProps {
    valueType?: never;
    value?: React.ReactNode;
    /** Rendered when value is absent or empty */
    invalidText?: React.ReactNode;
}

export type Props =
    | BooleanValueProps
    | DateValueProps
    | NodeValueProps
    | NumberValueProps
    | TextValueProps;

/**
 * Value-type multiplexer shared by labelled output components
 * (generic layer).
 *
 * Renders the display primitive matching `valueType` (BooleanDisplay,
 * DateDisplay or NumberDisplay, forwarding their respective props), plain
 * text for 'text', or the value as-is when `valueType` is omitted.
 * Carries no styling of its own; compose it inside styled components
 * such as DataDisplay or KeyFigure.
 *
 * `invalidText` has no default here: each display primitive applies its
 * own fallback, so wrappers can opt into a shared fallback by passing
 * one explicitly.
 */
function RawDisplay(props: Props) {
    const {
        invalidText,
        ...otherProps
    } = props;

    if (otherProps.valueType === 'boolean') {
        return (
            <BooleanDisplay
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    if (otherProps.valueType === 'number') {
        return (
            <NumberDisplay
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    if (otherProps.valueType === 'date') {
        return (
            <DateDisplay
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    const { value } = otherProps;

    // A raw Date is not a renderable node; treat it as an invalid value
    if (value instanceof Date) {
        return invalidText;
    }

    return value || invalidText;
}

export default RawDisplay;
